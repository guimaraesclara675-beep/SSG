// Configuração do Cloudflare (OpenNext). Todas as páginas do sistema são dinâmicas,
// então não usamos cache em R2 (que exigiria cartão cadastrado no Cloudflare).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
