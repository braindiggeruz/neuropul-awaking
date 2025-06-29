import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-auth',
}

interface NFTRequest {
  tg_id: string
  certificate_type: 'awakening' | 'level_milestone' | 'pvp_champion' | 'referral_master' | 'premium_member'
  metadata?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tg_id, certificate_type, metadata = {} }: NFTRequest = await req.json()

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, name, archetype, xp, level, avatar_url')
      .eq('tg_id', tg_id)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    // Check if NFT already exists
    const { data: existingNFT } = await supabase
      .from('nft_certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('certificate_type', certificate_type)
      .single()

    if (existingNFT) {
      throw new Error('NFT already exists for this certificate type')
    }

    // Generate NFT metadata
    const nftMetadata = {
      name: `NeuropulAI ${certificate_type.replace('_', ' ').toUpperCase()} Certificate`,
      description: `This NFT certifies that ${user.name} has achieved ${certificate_type.replace('_', ' ')} status in the NeuropulAI ecosystem.`,
      image: `https://neuropul.ai/nft/${certificate_type}/${user.id}.png`,
      attributes: [
        { trait_type: 'Certificate Type', value: certificate_type },
        { trait_type: 'User Name', value: user.name },
        { trait_type: 'Archetype', value: user.archetype },
        { trait_type: 'Level', value: user.level },
        { trait_type: 'XP', value: user.xp },
        { trait_type: 'Issue Date', value: new Date().toISOString().split('T')[0] },
        ...Object.entries(metadata).map(([key, value]) => ({ trait_type: key, value }))
      ],
      external_url: `https://neuropul.ai/profile/${user.id}`,
      animation_url: `https://neuropul.ai/nft/${certificate_type}/${user.id}.mp4`
    }

    // Upload metadata to IPFS (using web3.storage)
    const metadataBlob = new Blob([JSON.stringify(nftMetadata)], { type: 'application/json' })
    const metadataFormData = new FormData()
    metadataFormData.append('file', metadataBlob, 'metadata.json')

    const ipfsResponse = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WEB3_STORAGE_TOKEN')}`,
      },
      body: metadataFormData
    })

    if (!ipfsResponse.ok) {
      throw new Error('Failed to upload metadata to IPFS')
    }

    const ipfsData = await ipfsResponse.json()
    const metadataUri = `https://${ipfsData.cid}.ipfs.w3s.link/metadata.json`

    // For now, just store the NFT record without actual minting
    // In production, you would mint on Polygon here
    const { data: nftCertificate } = await supabase
      .from('nft_certificates')
      .insert({
        user_id: user.id,
        certificate_type,
        metadata_uri: metadataUri,
        image_uri: nftMetadata.image,
        blockchain: 'polygon'
      })
      .select()
      .single()

    // TODO: Actual blockchain minting would happen here
    // const contract = new ethers.Contract(contractAddress, abi, wallet)
    // const tx = await contract.mint(user.wallet_address, metadataUri)
    // const receipt = await tx.wait()

    return new Response(
      JSON.stringify({
        success: true,
        nft_certificate: nftCertificate,
        metadata_uri: metadataUri,
        opensea_url: `https://testnets.opensea.io/assets/mumbai/${Deno.env.get('NFT_CONTRACT_ADDRESS')}/${nftCertificate.id}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})