import assert from "assert"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import StreamTester from "streamtester"
import csvnorm from "../source/index.js"

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.resolve(currentDir, "../../tests")

let buffer = Buffer.alloc(0)
const streamTester = new StreamTester({
  test: (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk])
  },
})

streamTester.on("finish", () => {
  const expected = Buffer.from([
    "Date,Recipient,Amount",
    "2014-12-01,John,10 $",
    "2017-08-13,Anna,7 $",
    "2018-02-22,Ben,166 $",
    "",
  ].join("\n"))
  assert.equal(buffer.toString(), expected.toString())
  console.info(" ✔︎")
})

process.stdout.write("Force data format for parsing CSV")

csvnorm({
  dateFormat: "dd/mm/yyyy",
  readableStream: fs.createReadStream(
    path.join(testsDir, "banking/unusual-date-format.csv"),
  ),
  writableStream: streamTester,
})
