import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

const GRAPHQL_ENDPOINT = `/graphql`;
const TEST_USER = {
  email: 'nico@las.com',
  password: '12345',
};

// jest.mock("got")

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // 전체 앱모듈을 import를 한다. 전체 application을 로드해서 테스트한다.
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const dataSource: DataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const connection: DataSource = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email:"${TEST_USER.email}",
              password:"${TEST_USER.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        }); // end of it.
    }); // end of it

    it('계정 생성 실패', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation {
          createAccount(input: {
            email:"${TEST_USER.email}",
              password:"${TEST_USER.password}",
            role:Owner
          }) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    }); // end of it.
  }); //  ? end of describe

  describe('login', () => {
    it('로그인 성공.', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
      mutation {
        login(input: {
          email:"${TEST_USER.email}",
            password:"${TEST_USER.password}"
        }) {
          ok
          error
          token
        }
      }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          // console.log(login);
          expect(login.ok).toBe(true);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token; // 토큰 재활용
        });
    }); // END OF it

    it('로그인 실패..', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
      mutation {
        login(input: {
          email:"${TEST_USER.email}",
            password:"xxxxx"
        }) {
          ok
          error
          token
        }
      }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          // console.log(login);
          expect(login.ok).toBe(false);
          expect(login.token).toBe(null);
          expect(login.error).toEqual(expect.any(String));
          // expect(login.token).toEqual(expect.any(String));
        });
    }); // ? end of it.
  }); // ? end of describe login

  describe('userProfile', () => {}); // end of describe userProfile

  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');

  // rest api 예시
  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});
