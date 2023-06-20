import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { toWeb } from 'form-data';

const GRAPHQL_ENDPOINT = `/graphql`;
const TEST_USER = {
  email: 'loudsmile@naver.com',
  password: '12345',
};
const NEW_EMAIL = 'radiogaga.jin@gmail.com';

// jest.mock("got")

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // 전체 앱모듈을 import를 한다. 전체 application을 로드해서 테스트한다.
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User));
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

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it('유저 프로필 보기!', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken) // 헤더 설정
        .send({
          query: `
          {
            userProfile(userId:${userId}) {
              ok
              error
              user {
                id
              }
            }
          }
      `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;

          // console.log(login);
          expect(ok).toBe(true);
          expect(id).toBe(userId);
          // expect(login.token).toEqual(expect.any(String));
        });
    }); // end it

    it('유저 프로필 찾기 실패', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken) // 헤더 설정
        .send({
          query: `
          {
            userProfile(userId:9999) {
              ok
              error
              user {
                id
              }
            }
          }
      `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;

          // console.log(login);
          expect(ok).toBe(false);
          expect(user).toBe(null);
          // expect(login.token).toEqual(expect.any(String));
        });
    });
  }); // end of describe userProfile

  describe('me', () => {
    it('프로필 찾았음!', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken) // 헤더 설정
        .send({
          query: `
          {
            me {
              email
            }
          }
      `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;

          // console.log(login);
          expect(email).toBe(TEST_USER.email);
        }); // request
    }); // ? end of it

    it('인증실패한 me!', () => {
      return (
        request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          // .set(`X-JWT`, jwtToken) // 헤더 설정
          .send({
            query: `
          {
            me {
              email
            }
          }
      `,
          })
          .expect(200)
          .expect((res) => {
            // console.log(res.body);
            const {
              body: { errors },
            } = res;

            // console.log(login);
            // const [error] = errors;
            expect(errors).toEqual(expect.any(Array));
          })
      ); // request
    }); // end of it.
  }); // end of describe me

  describe('editProfile', () => {
    it('이메일 변경', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken) // 헤더 설정
        .send({
          query: `
          mutation {
            editProfile(input: {
              email:"${NEW_EMAIL}"
            }) {
              ok,
              error
            }
          }
      `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;

          // console.log(login);
          expect(ok).toBe(true);
        }); // request
    }); // ? end of it.

    it('변경된 이메일 체크', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken) // 헤더 설정
        .send({
          query: `
          {
            me {
              email
            }
          }
      `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;

          // console.log(login);
          expect(email).toBe(NEW_EMAIL);
        }); // request
    }); //? end of it.
  }); // ? end of descrbie editProfile

  it.todo('verifyEmail');

  // rest api 예시
  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});
