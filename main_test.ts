import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";

const host = "http://localhost:5000"

Deno.test("Landing Page", async function () {
  const response = await fetch(host + "/");
  const data = await response.json();
  const expect = { message: "HALO" };
  assertEquals(data, expect);
});
