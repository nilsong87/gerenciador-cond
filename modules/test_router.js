
import { initRouter } from '/modules/router.js';
import * as mockUi from '/modules/ui.js';
import * as mockAuth from '/modules/auth.js';

const resultsList = document.getElementById('test-results');

function test(description, testFn) {
    const listItem = document.createElement('li');
    try {
        testFn();
        listItem.textContent = `PASS: ${description}`;
        listItem.classList.add('pass');
    } catch (error) {
        listItem.textContent = `FAIL: ${description} - ${error.message}`;
        listItem.classList.add('fail');
        console.error(error);
    }
    resultsList.appendChild(listItem);
}

function assertEquals(expected, actual) {
    if (expected !== actual) {
        throw new Error(`Expected ${expected} but got ${actual}`);
    }
}

// --- Initialize Router ---
initRouter();

// --- Test Cases ---

test('should call showFeatureNotImplementedModal for user profile', () => {
    mockUi.reset();
    document.getElementById('nav-user-profile').click();
    assertEquals(true, mockUi.showFeatureNotImplementedModalCalled);
});

test('should call showFeatureNotImplementedModal for settings', () => {
    mockUi.reset();
    document.getElementById('nav-settings').click();
    assertEquals(true, mockUi.showFeatureNotImplementedModalCalled);
});

test('should call showFeatureNotImplementedModal for notifications', () => {
    mockUi.reset();
    document.getElementById('nav-notifications').click();
    assertEquals(true, mockUi.showFeatureNotImplementedModalCalled);
});

test('should call logout', () => {
    mockAuth.reset();
    document.getElementById('nav-logout').click();
    assertEquals(true, mockAuth.logoutCalled);
});
