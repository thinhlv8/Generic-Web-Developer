const request = require('supertest');
const app = require('./server');

describe('SafeVault Authentication and Authorization', () => {
    let adminToken;
    let userToken;

    test('Should login admin user successfully', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin_user', password: 'admin123' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        adminToken = res.body.token;
    });

    test('Should login regular user successfully', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'regular_user', password: 'user123' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        userToken = res.body.token;
    });

    test('Should prevent SQL Injection in login', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin_user', password: "' OR '1'='1" });
        
        expect(res.statusCode).toEqual(401);
    });

    test('Admin should access secret vault', async () => {
        const res = await request(app)
            .get('/vault/secret')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
    });

    test('Regular user should NOT access secret vault', async () => {
        const res = await request(app)
            .get('/vault/secret')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toEqual(403);
    });
});
