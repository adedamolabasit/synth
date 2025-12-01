import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface IpContextType {
  ipId: string;
  setIpId: Dispatch<SetStateAction<string>>;
}

const IpContext = createContext<IpContextType | undefined>(undefined);

export const IpProvider = ({ children }: { children: ReactNode }) => {
  const [ipId, setIpId] = useState<string>("");

  return (
    <IpContext.Provider value={{ ipId, setIpId }}>
      {children}
    </IpContext.Provider>
  );
};

export const useIp = () => {
  const context = useContext(IpContext);

  if (!context) {
    throw new Error("useIp must be used inside an IpProvider");
  }

  return context;
};
