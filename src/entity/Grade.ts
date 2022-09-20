import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
} from "typeorm";
import { Wilder } from "./Wilder";
import { Skill } from "./Skill";

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: number;

  @ManyToOne(() => Wilder, (wilder) => wilder.grades)
  wilder: Wilder;

  @ManyToOne(() => Skill, (skill) => skill.grades, {
    eager: true,
  })
  @JoinTable()
  skill: Skill;
}
