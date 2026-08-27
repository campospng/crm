# CMPX CRM

CRM do Campos Studio, com interface baseada no design exportado do Figma e fluxos locais inspirados no CMPX.

## Rodar localmente

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abra `http://localhost:8443`.

## Dados atuais

Nesta etapa, clientes, leads, tarefas, inbox, eventos e preferências de tema são salvos no `localStorage` do navegador. Use **Exportar backup** na barra lateral antes de trocar de navegador ou computador.

## Publicar na Vercel

1. Crie um repositório no GitHub e envie esta pasta.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. A Vercel detectará Vite automaticamente. Mantenha os comandos:
   - Build: `pnpm run build`
   - Output: `dist`
4. Em **Environment Variables**, adicione apenas as variáveis necessárias a partir de `.env.example`.
5. Faça o deploy.

O arquivo `package.json` fixa o uso do pnpm 11 para evitar divergência entre o computador local e a Vercel.

## WhatsApp: próxima etapa

O CRM atual é uma aplicação estática; uma conexão real com WhatsApp precisa de backend, banco de dados e webhooks. Ao implementar essa etapa:

- guarde `WHATSAPP_ACCESS_TOKEN` e os demais segredos apenas nas variáveis de ambiente da Vercel;
- valide o webhook no servidor, nunca no navegador;
- migre os dados de `localStorage` para um banco de dados antes de uso em múltiplos dispositivos.

Nenhuma chave secreta deve ser enviada ao GitHub.
