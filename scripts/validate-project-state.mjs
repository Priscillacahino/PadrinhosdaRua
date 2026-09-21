import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/App.tsx');
const data = read('src/data/oficinaData.ts');
const readme = read('README.md');
const metadata = read('metadata.json');

const checks = [
  [data.includes('CASINHAS_INSTALADAS_REAIS = 0'), 'o estado real deve registrar 0 casinhas instaladas'],
  [!data.includes("status: 'instalada_real'"), 'dados iniciais não podem começar como instalação real'],
  [app.includes('Modo demonstrativo'), 'a interface deve sinalizar o modo demonstrativo'],
  [app.includes('localStorage'), 'a simulação deve possuir persistência local no navegador'],
  [readme.includes('Nenhuma casinha está instalada no momento'), 'o README deve declarar a situação física atual'],
  [readme.includes('sem vínculo institucional, político, administrativo ou operacional'), 'o README deve manter a declaração de independência'],
  [metadata.includes('DEMONSTRATIVO_ENQUANTO_NAO_VALIDADO_EM_CAMPO'), 'metadata.json deve identificar a natureza demonstrativa dos dados'],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('Falha na validação de coerência do projeto:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Validação de coerência concluída: estado acadêmico e dados demonstrativos consistentes.');
