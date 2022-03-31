const supertest = require("supertest");


describe("View couter using basic memcached", () => {
  const { app, memcachedStore } = require("./services/memcached_basic.js");
  const serverAgent = supertest.agent(app);

  it("GET / should increment views value at each request", async () => {
    let lastPageView = 0;
    for (var i = 1; i < 50; i++) {
      const res = await serverAgent.get("/");
      expect(res.status).toEqual(200);
      expect(res.type).toEqual(expect.stringContaining("json"));
      expect(res.body.pageviews).toBeGreaterThan(lastPageView);
      lastPageView = res.body.pageviews;
    }
  });

  afterAll(() => {
    memcachedStore.client.end();
  });
});

describe("View couter using encrypted memcached", () => {
  const { app, memcachedStore } = require("./services/memcached_crypt.js");
  const serverAgent = supertest.agent(app);

  it("GET / should increment views value at each request", async () => {
    let lastPageView = 0;
    for (var i = 1; i < 50; i++) {
      const res = await serverAgent.get("/");
      expect(res.status).toEqual(200);
      expect(res.type).toEqual(expect.stringContaining("json"));
      expect(res.body.pageviews).toBeGreaterThan(lastPageView);
      lastPageView = res.body.pageviews;
    }
  });

  afterAll(() => {
    memcachedStore.client.end();
  });
});
