export type Player = {
    id: string;
    name: string;
    gender: Gender;
    drink: Drink;
    single: boolean;
};

export enum Gender {
    None = 'none',
    Female = 'female',
    Male = 'male',
}

export enum Drink {
    Beer = 'beer',
    Wine = 'wine',
    Strong = 'strong_drink',
    None = 'none'
}