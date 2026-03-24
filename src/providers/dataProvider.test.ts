import { describe, it, expect, vi, beforeEach } from "vitest";
import { dataProvider } from "./dataProvider";
import { apiClient } from "./apiProvider";

vi.mock("./apiProvider", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("./authProvider", () => ({
  auth0Client: {
    getTokenSilently: vi.fn().mockResolvedValue("mock-token"),
  },
}));

describe("dataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getList", () => {
    it("should fetch list of resources with pagination", async () => {
      const mockData = {
        items: [{ id: 1, name: "Test" }],
        total: 1,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await dataProvider.getList({
        resource: "analyses",
        pagination: { current: 1, pageSize: 10 },
      });

      expect(result.data).toEqual(mockData.items);
      expect(result.total).toBe(mockData.total);
    });
  });

  describe("getOne", () => {
    it("should fetch a single resource", async () => {
      const mockData = { id: 1, name: "Test" };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await dataProvider.getOne({
        resource: "analyses",
        id: "1",
      });

      expect(result.data).toEqual(mockData);
    });
  });

  describe("create", () => {
    it("should create a new resource", async () => {
      const mockData = { id: 1, name: "New Test" };

      vi.mocked(apiClient.post).mockResolvedValue(mockData);

      const result = await dataProvider.create({
        resource: "analyses",
        variables: { name: "New Test" },
      });

      expect(result.data).toEqual(mockData);
    });
  });

  describe("update", () => {
    it("should update an existing resource", async () => {
      const mockData = { id: 1, name: "Updated Test" };

      vi.mocked(apiClient.put).mockResolvedValue(mockData);

      const result = await dataProvider.update({
        resource: "analyses",
        id: "1",
        variables: { name: "Updated Test" },
      });

      expect(result.data).toEqual(mockData);
    });
  });

  describe("deleteOne", () => {
    it("should delete a resource", async () => {
      const mockData = { id: 1 };

      vi.mocked(apiClient.delete).mockResolvedValue(mockData);

      const result = await dataProvider.deleteOne({
        resource: "analyses",
        id: "1",
      });

      expect(result.data).toEqual(mockData);
    });
  });

  describe("getApiUrl", () => {
    it("should return the API URL", () => {
      const url = dataProvider.getApiUrl();
      expect(url).toBeDefined();
      expect(typeof url).toBe("string");
    });
  });
});
