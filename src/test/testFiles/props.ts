import { Car } from "./interfaces";

interface Props {
  car: Car;
}

export const getName = (props: Props) => {
  const name = props.car.manufacturer.name;
  const year = props.car.year;
  return {
    year,
    name,
  };
};
