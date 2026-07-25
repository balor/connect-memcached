const Memcached = require("memcached");
const session = require("express-session");
const MemcachedStore = require("../lib/connect-memcached")(session);

const HOST = process.env.MEMCACHED_HOST || "127.0.0.1:11211";
const SECRET = "Hello There Stranger2025!?";

function sess(views) {
  return { cookie: { maxAge: 60000 }, views: views };
}

describe("MemcachedStore direct API (plain)", () => {
  let client, store;

  beforeAll(() => {
    client = new Memcached(HOST);
    store = new MemcachedStore({ client: client, prefix: "unit_plain_" });
  });

  afterAll(() => {
    client.end();
  });

  it("set/get round-trips the session object", (done) => {
    store.set("sid1", sess(7), (err) => {
      expect(err).toBeFalsy();
      store.get("sid1", (err, data) => {
        expect(err).toBeFalsy();
        expect(data).toBeDefined();
        expect(data.views).toBe(7);
        done();
      });
    });
  });

  it("get on a missing key returns no session and no error", (done) => {
    store.get("does-not-exist", (err, data) => {
      expect(err).toBeFalsy();
      expect(data).toBeUndefined();
      done();
    });
  });

  it("destroy removes the session", (done) => {
    store.set("sid2", sess(1), (err) => {
      expect(err).toBeFalsy();
      store.destroy("sid2", (err) => {
        expect(err).toBeFalsy();
        store.get("sid2", (err, data) => {
          expect(err).toBeFalsy();
          expect(data).toBeUndefined();
          done();
        });
      });
    });
  });

  it("touch refreshes the stored session", (done) => {
    store.set("sid3", sess(1), (err) => {
      expect(err).toBeFalsy();
      store.touch("sid3", sess(2), (err) => {
        expect(err).toBeFalsy();
        store.get("sid3", (err, data) => {
          expect(err).toBeFalsy();
          expect(data.views).toBe(2);
          done();
        });
      });
    });
  });
});

describe("MemcachedStore direct API (encrypted)", () => {
  let client, store;

  beforeAll(() => {
    client = new Memcached(HOST);
    store = new MemcachedStore({
      client: client,
      prefix: "unit_crypt_",
      secret: SECRET,
    });
  });

  afterAll(() => {
    client.end();
  });

  it("set/get round-trips the session object", (done) => {
    store.set("sid1", sess(42), (err) => {
      expect(err).toBeFalsy();
      store.get("sid1", (err, data) => {
        expect(err).toBeFalsy();
        expect(data).toBeDefined();
        expect(data.views).toBe(42);
        expect(data.cookie.maxAge).toBe(60000);
        done();
      });
    });
  });

  it("stores ciphertext at rest (no plaintext in memcached)", (done) => {
    store.set("sid2", sess(99), (err) => {
      expect(err).toBeFalsy();
      client.get("unit_crypt_sid2", (err, raw) => {
        expect(err).toBeFalsy();
        expect(typeof raw).toBe("string");
        // base64 ciphertext can never contain double quotes, while the
        // plaintext JSON session always would.
        expect(raw).not.toContain('"views"');
        expect(raw).not.toContain('"cookie"');
        expect(raw).toMatch(/^[A-Za-z0-9+/=]+$/);
        done();
      });
    });
  });

  it("does not persist anything when encryption fails (weak secret)", (done) => {
    const weakStore = new MemcachedStore({
      client: client,
      prefix: "unit_weak_",
      secret: "weak",
    });

    weakStore.set("sid3", sess(1), (err) => {
      expect(err).toBeTruthy();
      client.get("unit_weak_sid3", (err2, raw) => {
        expect(err2).toBeFalsy();
        expect(raw).toBeUndefined();
        done();
      });
    });
  });

  it("treats undecryptable entries as a missing session", (done) => {
    // Write a plaintext payload under the encrypted prefix to simulate
    // an entry that cannot be decrypted (e.g. after a secret change).
    client.set("unit_crypt_sid4", JSON.stringify(sess(5)), 60, (err) => {
      expect(err).toBeFalsy();
      store.get("sid4", (err, data) => {
        expect(err).toBeFalsy();
        expect(data).toBeUndefined();
        done();
      });
    });
  });

  it("destroy removes an encrypted session", (done) => {
    store.set("sid5", sess(3), (err) => {
      expect(err).toBeFalsy();
      store.destroy("sid5", (err) => {
        expect(err).toBeFalsy();
        store.get("sid5", (err, data) => {
          expect(err).toBeFalsy();
          expect(data).toBeUndefined();
          done();
        });
      });
    });
  });
});
