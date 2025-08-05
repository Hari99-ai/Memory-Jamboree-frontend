import { atom } from "recoil";
import { getDisciplines } from "../lib/api";
import { DisciplineData } from "../types/index";

export const disciplineListAtom = atom<DisciplineData[]>({
  key: "disciplineListAtom",
  default: [],
  effects_UNSTABLE: [
    ({ setSelf, trigger }) => {
      if (trigger === "get") {
        setSelf(getDisciplines());
      }
    },
  ],
});
