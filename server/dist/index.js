"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const spots_1 = __importDefault(require("./routes/spots"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/spots", spots_1.default);
app.use("/bookings", bookings_1.default);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unexpected error" });
});
app.listen(PORT, () => {
    console.log(`Campsite booking API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map