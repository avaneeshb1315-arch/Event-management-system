function bookingLogout() {
    sessionStorage.removeItem("booking_token");
    sessionStorage.removeItem("seat_booking_reservation");
    location.replace("/booking/login.html");
}

async function authFetch(url, options = {}) {
    const token = sessionStorage.getItem("booking_token");

    if (!token) {
        bookingLogout();
        throw new Error("Please login first");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", "Bearer " + token);

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 ||
        response.status === 403) {
        bookingLogout();
        throw new Error("Session expired");
    }

    return response;
}

function checkLogin() {
    if (!sessionStorage.getItem("booking_token")) {
        bookingLogout();
    }
}

checkLogin();

window.addEventListener("pageshow", checkLogin);
