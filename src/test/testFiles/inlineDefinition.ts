import { Car } from "./interfaces";

export const inlineDefinition = () => {
  const car: Car = {
    model: "Civic",
    year: 2020,
    manufacturer: {
      name: "Honda",
    },
  };
  return car;
};
