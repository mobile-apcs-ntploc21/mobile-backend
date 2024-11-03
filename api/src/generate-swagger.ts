import { swaggerSpec } from "./swagger";
import fs from "fs";

fs.writeFileSync("./docs/swagger.json", JSON.stringify(swaggerSpec, null, 2));
