import { swaggerSpec } from ".";
import fs from "fs";

fs.writeFileSync("swagger.json", JSON.stringify(swaggerSpec, null, 2));
