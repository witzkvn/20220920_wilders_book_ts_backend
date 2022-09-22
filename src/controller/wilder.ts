import { Wilder } from "../entity/Wilder";
import { createGradeForWilder } from "./grade";
import dataSource from "../utils";
import { IController } from "../interfaces/IController";
<<<<<<< HEAD

const wilderController: IController = {
  create: async (req, res) => {
    try {
      const { name, city, description, skills } = req.body;

      const createdWilder = await dataSource.getRepository(Wilder).save({
        name,
        city,
        description,
      });

      let isNotFoundAndBreak = false;
      if (skills.length > 0) {
        for (const skill of req.body.skills) {
          const addRes = await createGradeForWilder(
            createdWilder.id,
            skill.id,
            skill.grades
          );

          if (addRes === null) {
            isNotFoundAndBreak = true;
            break;
          }
        }
      }

      if (isNotFoundAndBreak) {
        res.status(400).send({
          message: "No wilder or skill found with the provided IDs",
        });
        return;
      }

      res
        .status(201)
        .send({ message: "Created wilder", newWilder: createdWilder });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while creating wilder" });
    }
  },
  getAll: async (req, res) => {
    try {
      const allWilders = await dataSource.getRepository(Wilder).find({
        relations: {
          grades: {
            skill: true,
          },
        },
      });

      const formattedResponse = allWilders.map((el) => {
        const elSkills = el.grades.map((grade) => {
          return {
            title: grade.skill.name,
            grades: grade.grade,
          };
        });

        return {
          id: el.id,
          name: el.name,
          description: el.description,
          city: el.city,
          skills: elSkills,
        };
      });

      res.status(200).send({ message: "Success", wilders: formattedResponse });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error while getting all wilders" });
    }
  },
  updateById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res
          .status(400)
          .send({ message: "No valid wilder ID specified in the route" });
        return;
      }

      const updateRes = await dataSource
        .getRepository(Wilder)
        .update({ id: wilderId }, req.body);

      if (updateRes.affected === 0) {
        res.status(400).send({
          message:
            "No update could be effectued. Please check the wilder id and your request body.",
        });
      } else {
        res.status(204).send({ message: "Wilder updated successfully" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error while updating the requested wilder" });
    }
  },
  deleteById: async (req, res) => {
    try {
      const wilderId = parseInt(req.params.wilderid);
      if (isNaN(wilderId)) {
        res
          .status(500)
          .send({ message: "No valid wilder ID specified in the route" });
        return;
      }

      const deleteRes = await dataSource
        .getRepository(Wilder)
        .delete({ id: wilderId });

      if (deleteRes.affected === 0) {
        res.status(400).send({
          message: "No delete could be effectued. Please check the wilder id.",
        });
      } else {
        res.status(200).send({ message: "Wilder deleted successfully" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Error while deleting the requested wilder" });
    }
  },
=======
import { Grade } from "../entity/Grade";
import { IGrade } from "../interfaces/IGrade";

const wilderController: IController = {
    create: async (req, res) => {
        try {
            const { name, city, description, skills } = req.body;

            const createdWilder = await dataSource.getRepository(Wilder).save({
                name,
                city,
                description,
            });

            let isNotFoundAndBreak = false;
            if (skills.length > 0) {
                for (const skill of req.body.skills) {
                    const addRes = await createGradeForWilder(
                        createdWilder.id,
                        skill.id,
                        skill.grades
                    );

                    if (addRes === null) {
                        isNotFoundAndBreak = true;
                        break;
                    }
                }
            }

            if (isNotFoundAndBreak) {
                res.status(400).send({
                    message: "No wilder or skill found with the provided IDs",
                });
                return;
            }

            res.status(201).send({
                message: "Created wilder",
                newWilder: createdWilder,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error while creating wilder" });
        }
    },
    getAll: async (req, res) => {
        try {
            const allWilders = await dataSource.getRepository(Wilder).find({
                relations: {
                    grades: {
                        skill: true,
                    },
                },
            });

            const formattedResponse = allWilders.map((el) => {
                const elSkills = el.grades.map((grade) => {
                    return {
                        id: grade.id,
                        name: grade.skill.name,
                        grades: grade.grade,
                    };
                });

                return {
                    id: el.id,
                    name: el.name,
                    description: el.description,
                    city: el.city,
                    skills: elSkills,
                };
            });

            res.status(200).send({
                message: "Success",
                wilders: formattedResponse,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Error while getting all wilders",
            });
        }
    },
    updateById: async (req, res) => {
        try {
            const wilderId = parseInt(req.params.wilderid);
            if (isNaN(wilderId)) {
                res.status(400).send({
                    message: "No valid wilder ID specified in the route",
                });
                return;
            }

            const wilderToUpdate = await dataSource
                .getRepository(Wilder)
                .findBy({ id: wilderId });
            if (wilderToUpdate === null || wilderToUpdate === undefined) {
                res.status(404).send({
                    message: "No wilder found with that ID.",
                });
                return;
            }

            const updateRes = await dataSource.getRepository(Wilder).update(
                { id: wilderId },
                {
                    name: req.body.name,
                    city: req.body.city,
                    description: req.body.description,
                }
            );

            const wilderSkillsInDb = await dataSource
                .getRepository(Grade)
                .find({
                    where: {
                        wilder: {
                            id: wilderId,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            // delete grades not present in req.body.skills
            const bodySkillsIds = req.body.skills.map((el) => el.id);
            const gradeIdsToDelete = wilderSkillsInDb.filter((el) => {
                if (req.body.skills.includes(el.id)) return false;
                return true;
            });
            gradeIdsToDelete.forEach(async (grade) => {
                await dataSource.getRepository(Grade).delete(grade.id);
            });

            // update grades in common based on ID
            const gradesIdsToUpdate = wilderSkillsInDb.filter((el) => {
                return req.body.skills.includes(el.id);
            });
            gradesIdsToUpdate.forEach(async (grade) => {
                await dataSource.getRepository(Grade).update(grade.id, {
                    wilder: grade.wilder,
                    grade: grade.grade,
                    skill: grade.skill,
                });
            });

            // create grades that is not already in db

            // req.body.skills.forEach(async (grade: IGrade) => {
            //     const existingGrade = await dataSource
            //         .getRepository(Grade)
            //         .findBy({ id: grade.id });
            // });

            if (updateRes.affected === 0) {
                res.status(400).send({
                    message:
                        "No update could be effectued. Please check the wilder id and your request body.",
                });
            } else {
                res.status(204).send({
                    message: "Wilder updated successfully",
                });
            }
        } catch (error) {
            res.status(500).send({
                message: "Error while updating the requested wilder",
            });
        }
    },
    deleteById: async (req, res) => {
        try {
            const wilderId = parseInt(req.params.wilderid);
            if (isNaN(wilderId)) {
                res.status(500).send({
                    message: "No valid wilder ID specified in the route",
                });
                return;
            }

            const deleteRes = await dataSource
                .getRepository(Wilder)
                .delete({ id: wilderId });

            if (deleteRes.affected === 0) {
                res.status(400).send({
                    message:
                        "No delete could be effectued. Please check the wilder id.",
                });
            } else {
                res.status(200).send({
                    message: "Wilder deleted successfully",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Error while deleting the requested wilder",
            });
        }
    },
>>>>>>> c47072fba63a1be42cc9a1111f9a88691a69d6e7
};

export default wilderController;
