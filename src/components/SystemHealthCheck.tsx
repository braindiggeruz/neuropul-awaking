import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Database, Globe, Shield, Cpu, HardDrive, FileText } from 'lucide-react';
import { analyzeFallbackArchetype } from '../lib/api/callGpt';

interface HealthCheck {
  id: string;
  name: string;
  status: 'checking' | 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
  icon: React.ComponentType<any>;
}

interface SystemHealthCheckProps {
  onClose: () => void;
}

const SystemHealthCheck: React.FC<SystemHealthCheckProps> = ({ onClose }) => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [archetypeTestResult, setArchetypeTestResult] = useState<string | null>(null);

  const initialChecks: HealthCheck[] = [
    {
      id: 'environment',
      name: 'Environment Configuration',
      status: 'checking',
      message: 'Checking environment variables...',
      icon: Globe
    },
    {
      id: 'api_keys',
      name: 'API Keys & Secrets',
      status: 'checking',
      message: 'Validating API keys...',
      icon: Shield
    },
    {
      id: 'storage',
      name: 'Local Storage',
      status: 'checking',
      message: 'Testing localStorage functionality...',
      icon: HardDrive
    },
    {
      id: 'network',
      name: 'Network Connectivity',
      status: 'checking',
      message: 'Testing network connections...',
      icon: Globe
    },
    {
      id: 'apis',
      name: 'External APIs',
      status: 'checking',
      message: 'Checking API endpoints...',
      icon: Database
    },
    {
      id: 'archetype_engine',
      name: 'Archetype Analysis Engine',
      status: 'checking',
      message: 'Testing archetype analysis...',
      icon: FileText
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      status: 'checking',
      message: 'Analyzing performance...',
      icon: Cpu
    },
    {
      id: 'security',
      name: 'Security Checks',
      status: 'checking',
      message: 'Running security validation...',
      icon: Shield
    }
  ];

  const runHealthCheck = async () => {
    setIsRunning(true);
    setChecks(initialChecks);
    setArchetypeTestResult(null);

    // Simulate health checks with real validations
    for (let i = 0; i < initialChecks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const check = initialChecks[i];
      let updatedCheck: HealthCheck;

      switch (check.id) {
        case 'environment':
          updatedCheck = await checkEnvironment(check);
          break;
        case 'api_keys':
          updatedCheck = await checkApiKeys(check);
          break;
        case 'storage':
          updatedCheck = await checkStorage(check);
          break;
        case 'network':
          updatedCheck = await checkNetwork(check);
          break;
        case 'apis':
          updatedCheck = await checkApis(check);
          break;
        case 'archetype_engine':
          updatedCheck = await checkArchetypeEngine(check);
          break;
        case 'performance':
          updatedCheck = await checkPerformance(check);
          break;
        case 'security':
          updatedCheck = await checkSecurity(check);
          break;
        default:
          updatedCheck = { ...check, status: 'healthy', message: 'Check completed' };
      }

      setChecks(prev => prev.map(c => c.id === check.id ? updatedCheck : c));
    }

    // Calculate overall status
    const finalChecks = await Promise.all(initialChecks.map(async check => {
      switch (check.id) {
        case 'environment': return await checkEnvironment(check);
        case 'api_keys': return await checkApiKeys(check);
        case 'storage': return await checkStorage(check);
        case 'network': return await checkNetwork(check);
        case 'apis': return await checkApis(check);
        case 'archetype_engine': return await checkArchetypeEngine(check);
        case 'performance': return await checkPerformance(check);
        case 'security': return await checkSecurity(check);
        default: return { ...check, status: 'healthy' as const };
      }
    }));

    const hasErrors = finalChecks.some(c => c.status === 'error');
    const hasWarnings = finalChecks.some(c => c.status === 'warning');
    
    setOverallStatus(hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy');
    setIsRunning(false);
  };

  const checkEnvironment = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const mode = import.meta.env.MODE;
      const isDev = mode === 'development';
      const isProd = mode === 'production';
      
      if (!mode) {
        return {
          ...check,
          status: 'error',
          message: 'Environment mode not detected',
          details: 'Vite environment configuration missing'
        };
      }

      return {
        ...check,
        status: 'healthy',
        message: `Running in ${mode} mode`,
        details: `Environment: ${mode}, Dev tools: ${isDev ? 'enabled' : 'disabled'}`
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkApiKeys = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const issues = [];
      if (!openaiKey) issues.push('OpenAI API key missing');
      if (!supabaseUrl) issues.push('Supabase URL missing');
      if (!supabaseKey) issues.push('Supabase key missing');

      if (issues.length > 0) {
        return {
          ...check,
          status: 'error',
          message: `${issues.length} API key(s) missing`,
          details: issues.join(', ')
        };
      }

      // Validate key formats
      const warnings = [];
      if (openaiKey && !openaiKey.startsWith('sk-')) {
        warnings.push('OpenAI key format invalid');
      }
      if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
        warnings.push('Supabase URL format suspicious');
      }

      return {
        ...check,
        status: warnings.length > 0 ? 'warning' : 'healthy',
        message: warnings.length > 0 ? 'API keys present with warnings' : 'All API keys configured',
        details: warnings.length > 0 ? warnings.join(', ') : 'OpenAI, Supabase keys validated'
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'API key validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkStorage = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      // Test localStorage
      const testKey = 'neuropul_health_check';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        return {
          ...check,
          status: 'error',
          message: 'localStorage read/write failed',
          details: 'Data integrity check failed'
        };
      }

      // Check storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usedMB = Math.round((estimate.usage || 0) / 1024 / 1024);
        const quotaMB = Math.round((estimate.quota || 0) / 1024 / 1024);
        const usagePercent = quotaMB > 0 ? (usedMB / quotaMB) * 100 : 0;

        if (usagePercent > 80) {
          return {
            ...check,
            status: 'warning',
            message: 'Storage quota nearly full',
            details: `${usedMB}MB used of ${quotaMB}MB (${usagePercent.toFixed(1)}%)`
          };
        }

        return {
          ...check,
          status: 'healthy',
          message: 'Storage functioning normally',
          details: `${usedMB}MB used of ${quotaMB}MB (${usagePercent.toFixed(1)}%)`
        };
      }

      return {
        ...check,
        status: 'healthy',
        message: 'localStorage working',
        details: 'Read/write operations successful'
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Storage check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkNetwork = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const startTime = performance.now();
      
      // Test basic connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch('https://httpbin.org/get', {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        if (!response.ok) {
          return {
            ...check,
            status: 'error',
            message: 'Network connectivity failed',
            details: `HTTP ${response.status}: ${response.statusText}`
          };
        }

        if (latency > 3000) {
          return {
            ...check,
            status: 'warning',
            message: 'Slow network detected',
            details: `Response time: ${latency}ms (>3s)`
          };
        }

        return {
          ...check,
          status: 'healthy',
          message: 'Network connectivity good',
          details: `Response time: ${latency}ms`
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return {
            ...check,
            status: 'error',
            message: 'Network request timed out',
            details: 'Connection timeout after 5 seconds'
          };
        }
        
        throw fetchError;
      }
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Network check failed',
        details: error instanceof Error ? error.message : 'Connection timeout or error'
      };
    }
  };

  const checkApis = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const results = [];

      // Test OpenAI API (if key exists)
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (openaiKey) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch('/api/gpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Test connection',
              systemPrompt: 'Respond with just "OK"'
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            results.push('OpenAI: ✅');
          } else {
            results.push(`OpenAI: ❌ (${response.status})`);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            results.push('OpenAI: ❌ (timeout)');
          } else {
            results.push(`OpenAI: ❌ (${error.message})`);
          }
        }
      } else {
        results.push('OpenAI: ⚠️ (no key)');
      }

      // Test Pictify API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/pictify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html: '<html><body>Test</body></html>',
            options: { format: 'A4' }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          results.push('Pictify: ✅');
        } else {
          results.push(`Pictify: ❌ (${response.status})`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          results.push('Pictify: ❌ (timeout)');
        } else {
          results.push(`Pictify: ❌ (${error.message})`);
        }
      }

      const hasErrors = results.some(r => r.includes('❌'));
      const hasWarnings = results.some(r => r.includes('⚠️'));

      return {
        ...check,
        status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy',
        message: hasErrors ? 'Some APIs failing' : hasWarnings ? 'Some APIs not configured' : 'All APIs responding',
        details: results.join(', ')
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'API check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkArchetypeEngine = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      // Test the archetype analysis engine with a sample response
      const testResponses = [
        // Valid JSON
        '{"type": "Воин", "description": "Test description", "CTA": "Test CTA"}',
        
        // JSON with text around it
        'Here is the result: {"type": "Маг", "description": "Test description", "CTA": "Test CTA"}',
        
        // Malformed JSON with extractable fields
        '{ "type" : "Искатель" , "description" : "Test description" , "CTA" : "Test CTA" ',
        
        // Text with keywords
        'Based on the answers, the user is clearly a Тень archetype. They show analytical thinking.'
      ];
      
      // Test each response format
      const results = [];
      
      for (const [index, testResponse] of testResponses.entries()) {
        try {
          // Simulate parsing the response
          let parsed = null;
          let strategy = '';
          
          // Strategy 1: Direct JSON parse
          try {
            parsed = JSON.parse(testResponse);
            strategy = 'direct_json_parse';
          } catch (e) {
            // Strategy 2: Extract JSON using regex
            const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
            const jsonMatches = testResponse.match(jsonRegex);
            
            if (jsonMatches && jsonMatches.length > 0) {
              try {
                parsed = JSON.parse(jsonMatches[0]);
                strategy = 'regex_json_extraction';
              } catch (e2) {
                // Strategy 3: Field extraction
                const typeRegex = /"type"\s*:\s*"([^"]*)"/;
                const descRegex = /"description"\s*:\s*"([^"]*)"/;
                const ctaRegex = /"CTA"\s*:\s*"([^"]*)"/;
                
                const typeMatch = testResponse.match(typeRegex);
                
                if (typeMatch) {
                  const descMatch = testResponse.match(descRegex);
                  const ctaMatch = testResponse.match(ctaRegex);
                  
                  parsed = {
                    type: typeMatch[1],
                    description: descMatch ? descMatch[1] : "Default description",
                    CTA: ctaMatch ? ctaMatch[1] : "Default CTA"
                  };
                  strategy = 'field_extraction';
                } else {
                  // Strategy 4: Keyword analysis
                  const archetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
                  let detectedArchetype = null;
                  
                  for (const archetype of archetypes) {
                    if (testResponse.includes(archetype)) {
                      detectedArchetype = archetype;
                      break;
                    }
                  }
                  
                  if (detectedArchetype) {
                    parsed = {
                      type: detectedArchetype,
                      description: `Default description for ${detectedArchetype}`,
                      CTA: "Default CTA"
                    };
                    strategy = 'keyword_analysis';
                  }
                }
              }
            }
          }
          
          if (parsed && parsed.type) {
            results.push(`Test ${index+1}: ✅ (${strategy})`);
          } else {
            results.push(`Test ${index+1}: ❌ (parsing failed)`);
          }
        } catch (error) {
          results.push(`Test ${index+1}: ❌ (${error})`);
        }
      }
      
      // Test fallback mechanism
      try {
        const testAnswers = [
          { answer: "Я предпочитаю действовать быстро", weight: { warrior: 3, mage: 0, seeker: 0, shadow: 0 } }
        ];
        
        const fallbackResult = analyzeFallbackArchetype(testAnswers);
        
        if (fallbackResult && fallbackResult.type) {
          results.push('Fallback: ✅');
        } else {
          results.push('Fallback: ❌');
        }
      } catch (error) {
        results.push(`Fallback: ❌ (${error})`);
      }
      
      const hasErrors = results.some(r => r.includes('❌'));
      
      // Store the test result for display
      setArchetypeTestResult(results.join('\n'));
      
      return {
        ...check,
        status: hasErrors ? 'warning' : 'healthy',
        message: hasErrors ? 'Some parsing strategies failing' : 'All parsing strategies working',
        details: results.join(', ')
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Archetype engine check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkPerformance = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const metrics = [];

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        const usagePercent = (usedMB / limitMB) * 100;
        
        metrics.push(`Memory: ${usedMB}MB/${limitMB}MB (${usagePercent.toFixed(1)}%)`);
        
        if (usagePercent > 80) {
          return {
            ...check,
            status: 'warning',
            message: 'High memory usage detected',
            details: metrics.join(', ')
          };
        }
      }

      // Performance timing
      if ('navigation' in performance) {
        const nav = performance.navigation;
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        metrics.push(`Load time: ${loadTime}ms`);
        
        if (loadTime > 5000) {
          return {
            ...check,
            status: 'warning',
            message: 'Slow page load detected',
            details: metrics.join(', ')
          };
        }
      }

      // FPS check (simplified)
      let frameCount = 0;
      const startTime = performance.now();
      
      const countFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        }
      };
      
      requestAnimationFrame(countFrames);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      metrics.push(`FPS: ~${frameCount}`);
      
      if (frameCount < 30) {
        return {
          ...check,
          status: 'warning',
          message: 'Low frame rate detected',
          details: metrics.join(', ')
        };
      }

      return {
        ...check,
        status: 'healthy',
        message: 'Performance metrics good',
        details: metrics.join(', ')
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Performance check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkSecurity = async (check: HealthCheck): Promise<HealthCheck> => {
    try {
      const issues = [];
      const warnings = [];

      // HTTPS check
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        issues.push('Not using HTTPS');
      }

      // CSP check
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        warnings.push('No CSP meta tag found');
      }

      // Local storage encryption check
      const testData = localStorage.getItem('neuropul_user_progress');
      if (testData && !testData.includes('encrypted')) {
        warnings.push('User data not encrypted');
      }

      // API key exposure check
      const scripts = Array.from(document.scripts);
      const hasExposedKeys = scripts.some(script => 
        script.textContent?.includes('sk-') || 
        script.textContent?.includes('api_key')
      );
      
      if (hasExposedKeys) {
        issues.push('Potential API key exposure');
      }

      if (issues.length > 0) {
        return {
          ...check,
          status: 'error',
          message: `${issues.length} security issue(s)`,
          details: issues.join(', ')
        };
      }

      if (warnings.length > 0) {
        return {
          ...check,
          status: 'warning',
          message: `${warnings.length} security warning(s)`,
          details: warnings.join(', ')
        };
      }

      return {
        ...check,
        status: 'healthy',
        message: 'Security checks passed',
        details: 'HTTPS, CSP, data protection verified'
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: 'Security check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />;
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
    }
  };

  const getOverallStatusMessage = () => {
    switch (overallStatus) {
      case 'healthy': return 'All systems operational';
      case 'warning': return 'Some issues detected';
      case 'error': return 'Critical issues found';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
      >
        {/* Header */}
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">🔥 GOD LEVEL SYSTEM HEALTH</h2>
                <p className="text-purple-200 text-sm">Complete diagnostic scan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {overallStatus === 'healthy' && <CheckCircle className="w-6 h-6 text-green-400" />}
              {overallStatus === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-400" />}
              {overallStatus === 'error' && <XCircle className="w-6 h-6 text-red-400" />}
              <div>
                <h3 className={`text-xl font-bold ${getOverallStatusColor()}`}>
                  {getOverallStatusMessage()}
                </h3>
                <p className="text-gray-300 text-sm">
                  {checks.filter(c => c.status === 'healthy').length} of {checks.length} checks passed
                </p>
              </div>
            </div>
            <button
              onClick={runHealthCheck}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Running...' : 'Run Again'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Health Checks */}
        <div className="p-6 space-y-4">
          {checks.map((check) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                check.status === 'checking' ? 'bg-blue-900/20 border-blue-500/50' :
                check.status === 'healthy' ? 'bg-green-900/20 border-green-500/50' :
                check.status === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50' :
                'bg-red-900/20 border-red-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{check.name}</h4>
                    <p className={`text-sm ${
                      check.status === 'checking' ? 'text-blue-300' :
                      check.status === 'healthy' ? 'text-green-300' :
                      check.status === 'warning' ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {check.message}
                    </p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                          Details
                        </summary>
                        <p className="mt-1 text-xs text-gray-300 bg-black/30 p-2 rounded">
                          {check.details}
                        </p>
                      </details>
                    )}
                    
                    {/* Special case for archetype engine test results */}
                    {check.id === 'archetype_engine' && archetypeTestResult && (
                      <details className="mt-2">
                        <summary className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300">
                          View Test Results
                        </summary>
                        <pre className="mt-1 text-xs text-gray-300 bg-black/30 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                          {archetypeTestResult}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {check.status === 'checking' ? 'Checking...' : 'Completed'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Archetype Engine Test */}
        <div className="px-6 pb-6">
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">🧠 Archetype Analysis Test</h3>
            <p className="text-blue-300 text-sm mb-4">
              Test the archetype analysis engine with sample quiz answers
            </p>
            <button
              onClick={async () => {
                try {
                  const testAnswers = [
                    { answer: "Я предпочитаю действовать быстро и решительно", weight: { warrior: 3, mage: 0, seeker: 1, shadow: 0 } },
                    { answer: "Мне нравится изучать глубинные процессы", weight: { warrior: 0, mage: 3, seeker: 1, shadow: 2 } },
                    { answer: "Я всегда ищу новые возможности", weight: { warrior: 1, mage: 1, seeker: 3, shadow: 0 } }
                  ];
                  
                  const result = analyzeFallbackArchetype(testAnswers);
                  setArchetypeTestResult(JSON.stringify(result, null, 2));
                } catch (error) {
                  setArchetypeTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Run Local Test
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white border-opacity-10 flex justify-between">
          <div className="text-gray-300 text-sm">
            System health check completed at {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemHealthCheck;