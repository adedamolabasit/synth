import request from "supertest";
import app from "../app";

describe("Audio Upload", () => {
  it("should reject empty upload", async () => {
    const res = await request(app).post("/api/audio/upload");
    expect(res.status).toBe(404);
  });
});
