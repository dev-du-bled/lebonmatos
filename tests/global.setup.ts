import { auth } from "@/lib/auth";

export const TEST_USER = {
    name: "Test Login",
    username: "testlogin",
    email: "testlogin@example.com",
    password: "testpassword",
};

export default async function globalSetup() {
    await auth.api.signUpEmail({
        body: {
            name: TEST_USER.name,
            username: TEST_USER.username,
            email: TEST_USER.email,
            password: TEST_USER.password,
        },
    });
}
