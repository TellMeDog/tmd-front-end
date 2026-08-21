import { places } from '../mocks/data/places';
import { mockRequest } from './client';

export const getPlaces = () => mockRequest(places);
export const getPlace = (placeId) => mockRequest(places.find(({ id }) => id === Number(placeId)));
