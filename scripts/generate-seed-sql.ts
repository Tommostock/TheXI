import { seedPlayers } from '../lib/players/seed-data'

const players = seedPlayers()

const escape = (s: string) => s.replace(/'/g, "''")

const values = players.map(
  (p) =>
    `('${escape(p.name)}', '${escape(p.nation)}', '${p.nation_flag_url}', '${p.position}')`
)

const sql =
  'INSERT INTO players (name, nation, nation_flag_url, position) VALUES\n' +
  values.join(',\n') +
  ';'

process.stdout.write(sql)
