
export let logoutCalled = false;

export function logout() {
    logoutCalled = true;
}

export function reset() {
    logoutCalled = false;
}

export const userRole = 'user';
export const currentUser = { email: 'test@test.com' };
