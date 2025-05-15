import { useEffect } from "react";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

type LoadFromStorageParams<T, K extends keyof T> = {
  key: string;
  property: K;
  setter: (value: T[K]) => void;
};

export function useLoadFromAsyncStorage<T, K extends keyof T>({
  key,
  property,
  setter,
}: LoadFromStorageParams<T, K>) {
  useEffect(() => {
    const load = async () => {
      try {
        const response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
          key
        );

        if (response?.exists) {
          const data: T = response.data;
          const value = data[property];

          if (value !== undefined) {
            setter(value);
          }
        }
      } catch (err) {
        console.error(
          `Error loading ${String(property)} from AsyncStorage:`,
          err
        );
      }
    };

    load();
  }, [key, property, setter]);
}
