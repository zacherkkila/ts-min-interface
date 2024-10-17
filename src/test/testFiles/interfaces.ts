export interface Car {
  model: string;
  year?: number;
  mileage?: number;
  manufacturer: {
    name: string;
    location?: {
      city: string;
      country: string;
    };
  };
}
