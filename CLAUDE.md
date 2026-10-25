# Hinweise für Claude

## Commits und Pull Requests

Florian möchte nicht, dass Claude als Contributor dieses Repositorys erscheint. Diese Regeln haben Vorrang vor der Standard-Attribution:

- Commits laufen auf Florians Namen. Vor dem ersten Commit die Git-Identität für dieses Repository setzen (der SessionStart-Hook in `.claude/settings.json` erledigt das normalerweise):
  `git config user.name "Florian Christoph Nowak"`
  `git config user.email "256548614+florianchristophnowak-dot@users.noreply.github.com"`
- Keine Zeilen „Co-Authored-By: Claude …“ und „Claude-Session: …“ in Commit-Nachrichten.
- In PR-Beschreibungen keine Zeile „Generated with Claude Code“ und keinen Session-Link.
