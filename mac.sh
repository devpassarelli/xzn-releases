#!/bin/bash
# Instala (ou atualiza) o xzn launcher no Mac.
#   curl -fsSL https://devpassarelli.github.io/xzn-releases/mac.sh | bash
# O app ainda não tem a assinatura paga da Apple, e o Mac bloqueia o que foi baixado pelo navegador.
# Baixado por aqui (Terminal), ele não recebe a marca de "veio da internet" e abre direto.
set -e
URL="https://github.com/devpassarelli/xzn-releases/releases/latest/download/XzN-Launcher-Mac.dmg"
NOME="XzN Launcher.app"
DESTINO="/Applications"
[ -w "$DESTINO" ] || { DESTINO="$HOME/Applications"; mkdir -p "$DESTINO"; }

TMP=$(mktemp -d)
trap 'hdiutil detach "$TMP/mnt" -quiet 2>/dev/null || true; rm -rf "$TMP"' EXIT

echo "→ Baixando o xzn launcher…"
curl -fL --progress-bar "$URL" -o "$TMP/xzn.dmg"

echo "→ Instalando em $DESTINO…"
mkdir -p "$TMP/mnt"
hdiutil attach "$TMP/xzn.dmg" -nobrowse -noautoopen -quiet -mountpoint "$TMP/mnt"
osascript -e 'quit app "XzN Launcher"' >/dev/null 2>&1 || true
sleep 1
rm -rf "$DESTINO/$NOME"
cp -R "$TMP/mnt/$NOME" "$DESTINO/"
xattr -cr "$DESTINO/$NOME"

echo "✓ Pronto! Abrindo o xzn launcher."
open "$DESTINO/$NOME"
