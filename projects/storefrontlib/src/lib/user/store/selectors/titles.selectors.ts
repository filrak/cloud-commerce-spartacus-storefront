import { MemoizedSelector, createSelector } from '@ngrx/store';
import * as fromFeature from './../reducers';
import * as fromReducer from './../reducers/titles.reducer';

export const getTitlesState = createSelector(
  fromFeature.getUserState,
  (state: fromFeature.UserState) => state.titles
);

export const getTitlesEntites: MemoizedSelector<any, any> = createSelector(
  getTitlesState,
  fromReducer.getTitlesEntites
);

export const getAllTitles: MemoizedSelector<any, any> = createSelector(
  getTitlesEntites,
  entites => {
    return Object.keys(entites).map(code => entites[code]);
  }
);

export const titleSelectorFactory = (code): MemoizedSelector<any, any> => {
  return createSelector(getTitlesEntites, entities => {
    if (Object.keys(entities).length !== 0) {
      return entities[code];
    } else {
      return null;
    }
  });
};
