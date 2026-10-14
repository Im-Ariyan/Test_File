import { createContext, useContext, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { statuses, type RecordItem } from './data';
import { addRecordNote, advanceRecordStatus, campusRecordsOptions, restoreSampleCampus, submitRecord } from './records';

type NewRecord = Omit<RecordItem, 'id' | 'history'>;
type Store = {items:RecordItem[]; loading:boolean; loadError:string|null; refresh:()=>void; add:(item:NewRecord)=>Promise<void>; advance:(id:string)=>void; note:(id:string,note:string)=>void; simulate:(scenario:string)=>void; reset:()=>void; read:string[]; markRead:()=>void; role:string; setRole:(role:string)=>void};

const Context = createContext<Store | null>(null);

export function CampusProvider({children}:{children:ReactNode}) {
  const queryClient = useQueryClient();
  const {data, isLoading, error} = useQuery(campusRecordsOptions);
  const [read, setRead] = useState<string[]>([]);
  const [role, setRole] = useState('Administrator');
  const items = data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: campusRecordsOptions.queryKey });
  const fail = (fallback: string) => (error: unknown) => toast.error(error instanceof Error ? error.message : fallback);

  const create = useMutation({
    mutationFn: ({item, note}:{item:NewRecord; note:string}) => submitRecord(item, note),
    onSuccess: () => {refresh(); toast.success('Report submitted successfully');},
    onError: fail('Report could not be saved'),
  });
  const move = useMutation({
    mutationFn: advanceRecordStatus,
    onSuccess: () => {refresh(); toast.success('Request status updated');},
    onError: fail('Request status could not be updated'),
  });
  const annotate = useMutation({
    mutationFn: addRecordNote,
    onSuccess: () => {refresh(); toast.success('Note added');},
    onError: fail('Note could not be saved'),
  });
  const restore = useMutation({
    mutationFn: restoreSampleCampus,
    onSuccess: () => {refresh(); setRead([]); toast.success('Sample campus restored');},
    onError: fail('Sample campus could not be restored'),
  });

  const add = async (item: NewRecord) => { await create.mutateAsync({item, note: 'Report created'}); };

  const advance = (id: string) => {
    if (role === 'Student') {toast.error('Switch to an administrator or facilities demo role to update requests.');return;}
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    const index = statuses.indexOf(item.status);
    const status = statuses[Math.min(index + 1, statuses.length - 1)] ?? item.status;
    if (status === item.status) return;
    move.mutate({id, status, team: item.team || (index === 0 ? 'Facilities team' : ''), note: `${status} by ${role} (demo)`});
  };

  const note = (id: string, text: string) => {
    if (!text.trim()) return;
    annotate.mutate({id, note: text.trim().slice(0, 500)});
  };

  const simulate = (scenario: string) => {
    if (scenario === 'resolution') {
      const item = items.find((candidate) => candidate.kind === 'maintenance' && candidate.status !== 'Resolved');
      if (item) advance(item.id);
      return;
    }
    const team = scenario === 'security' ? 'Security team' : 'Facilities team';
    const base: NewRecord = scenario === 'water'
      ? {title:'Simulated pipe leakage', description:'Reading 9,600 L versus 8,000 L baseline (+20%). Inspect pipework.', building:'academic', category:'Plumbing', priority:'Critical', kind:'maintenance', status:'Reported', team}
      : scenario === 'energy'
        ? {title:'Simulated energy anomaly', description:'Observed 3,800 kWh compared with 2,860 kWh baseline (+32.9%). Inspect lab equipment.', building:'science', category:'Electrical', priority:'High', kind:'maintenance', status:'Reported', team}
        : {title:'Simulated suspicious login pattern', description:'8 failed logins in 10 minutes exceeds threshold of 5. Review access logs.', building:'admin', category:'Access control', priority:'High', kind:'security', status:'Reported', team};
    add(base);
    if (scenario === 'water') add({...base, title:'Community report: pipe leakage', kind:'community', priority:'High', team:'Plumbing team'});
  };

  const reset = () => restore.mutate();

  return <Context.Provider value={{items, loading:isLoading, loadError:error instanceof Error ? error.message : error ? 'Shared campus reports could not be loaded. Please try again.' : null, refresh:()=>{void refresh();}, add, advance, note, simulate, reset, read, markRead:()=>setRead(items.map((item)=>item.id)), role, setRole}}>{children}</Context.Provider>;
}

export function useCampus(){const ctx=useContext(Context);if(!ctx)throw new Error('Campus provider is missing');return ctx;}
