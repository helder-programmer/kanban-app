import bcrypt from 'bcrypt';
import { BeforeCreate, BeforeUpdate, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { IUser } from './types/IUser';
import Board from './Board';
import { IBoard } from './types/IBoard';

@Table({
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    modelName: 'tb_users',
})
export default class User extends Model<Partial<IUser>> implements IUser {

    @Column({
        primaryKey: true,
        type: DataType.CHAR
    })
    declare user_id: string;

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.STRING)
    declare email: string;

    @Column(DataType.STRING)
    declare password: string;

    @Column(DataType.DATE)
    declare created_at: Date;
    
    @Column(DataType.DATE)
    declare updated_at: Date;
    
    @HasMany(() => Board, 'user_id')
    declare boards: IBoard[];
    
    @BeforeCreate
    @BeforeUpdate
    public static async passwordEncrypt(instance: User) {
        if (instance.isNewRecord || instance.changed('password')) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(instance.password, saltRounds);
            instance.password = hashedPassword;
        }
    }

    public async isCorrectPassword(password: string) {
        const isEqualPassword = await bcrypt.compare(password, this.password);
        return isEqualPassword;
    }
}