interface User {
    id: number;
    passport: string; // 账号
    password: string; // 密码
    name: string; // 姓名
}

interface Session {
    user: User | null;        // 用户对象
}

export var session: Session = {
    user: null
};