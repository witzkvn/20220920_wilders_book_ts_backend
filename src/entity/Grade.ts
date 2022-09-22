import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Wilder } from "./Wilder";
import { Skill } from "./Skill";

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: number;

  @ManyToOne(() => Wilder, (wilder) => wilder.grades, {
    onDelete: "CASCADE",
  })
  wilder: Wilder;

  @ManyToOne(() => Skill, (skill) => skill.grades, {
    onDelete: "CASCADE",
  })
  skill: Skill;
}
