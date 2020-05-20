import { skQueryManager } from "../../jessie.js";
import { galleries } from "./galleries.mjs";

if (typeof self == "undefined") self = globalThis;

let q = new skQueryManager;
let $ = q.Query;

galleries();