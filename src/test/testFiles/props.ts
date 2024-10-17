import { Car } from "./interfaces";

interface Props {
  car: Car;
}

export const propsTest = (props: Props) => {
  const manufacturer = props.car.manufacturer;
  return manufacturer;
};
