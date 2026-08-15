import { AppRole, Auth0SessionUser, getRolesFromUser, hasRole, isAdmin } from "../lib/auth0-utils";


// 1. auth0 istemcisini mock'luyoruz
jest.mock('../lib/auth0', () => ({
  auth0: {
    getSession: jest.fn(),
  }
}));

// 2. Next.js yönlendirmesini mock'luyoruz
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Claim tanımı
const ROLES_CLAIM = "https://ecom-nextjs-project/roles";

// Helper: Test için kullanıcı nesnesi üretir
function userWithRoles(roles: unknown): Auth0SessionUser {
  return {
    sub: "auth0|1234567890",
    [ROLES_CLAIM]: roles,
  };
}

describe("Auth0 Utils Test Suite", () => {
  // Testler burada yer alacak
  // hasRole ve isAdmin fonksiyonlarını test etmek için örnek kullanıcılar oluşturuyoruz
  describe("hasRole", () => {
    it("should return true if the user has the specified role", () => {
      expect(hasRole(userWithRoles(["admin"]), AppRole.ADMIN)).toBe(true);
    });

    it("should return false if the user does not have the specified role", () => {
      expect(hasRole(userWithRoles(["user", "moderator", "customer", "supplier", "seller", "super-admin"]), AppRole.ADMIN)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true if the user has the admin role", () => {
      expect(isAdmin(userWithRoles(["admin"]))).toBe(true);
    });

    it("should return false if the user does not have the admin role", () => {
      expect(isAdmin(userWithRoles(["user"]))).toBe(false);
    });
  });

  describe("getRolesFromUser", () => {
    it("should return an array of roles if the user has roles", () => {
      expect(getRolesFromUser(null)).toEqual([]);
    });

    it("should return the user's roles if they exist", () => {
      expect(getRolesFromUser(userWithRoles(["admin"]))).toEqual(["admin"]);
    });
  });
});