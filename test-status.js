// Teste simples da API de status
fetch('http://localhost:3000/api/status/summary')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Status funcionando!');
    console.log('📊 Dados recebidos:');
    console.log('- Total de traces:', data.systemStatus?.total_traces || 0);
    console.log('- Taxa de erro:', data.systemStatus?.error_rate || 0);
    console.log('- Latência média:', data.systemStatus?.avg_latency || 0);
    console.log('- P95 routes:', data.p95?.length || 0);
    console.log('- Top routes:', data.topRoutes?.length || 0);
    console.log('- Error logs:', data.errorLogs?.length || 0);
  })
  .catch(error => {
    console.error('❌ Erro na API:', error);
  });
