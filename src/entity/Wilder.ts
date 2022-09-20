import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinTable,
} from "typeorm";
import { IWilder } from "../interfaces/IWilder";
import { Grade } from "./Grade";

@Entity()
export class Wilder implements IWilder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  description: string;

  @OneToMany(() => Grade, (grade) => grade.wilder, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  grades: Grade[];
}
