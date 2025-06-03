import {
  SleepData,
  StepsData,
  TrackingData,
  WaterData,
} from "@/app/interfaces/trackInterface";

type TrackingType = keyof TrackingData;

export const mergeTrackingDataByDate = (
  dataArray: any[],
  type: TrackingType,
  dateMap: { [date: string]: TrackingData }
) => {
  dataArray.forEach((item) => {
    const date = item.date;
    if (!dateMap[date]) {
      dateMap[date] = { steps: null, sleep: null, water: null };
    }
    dateMap[date][type] = item;
  });
};

export function filterTrackingData(
  StepsData: StepsData,
  SleepData: SleepData,
  waterData: WaterData
) {}
