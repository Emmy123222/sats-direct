import { CheckCircle, Circle, Clock } from "lucide-react";

interface TimelineEvent {
  title: string;
  description: string;
  timestamp?: number;
  completed: boolean;
}

interface TransactionTimelineProps {
  events: TimelineEvent[];
}

export function TransactionTimeline({ events }: TransactionTimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            {event.completed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300" />
            )}
            {index < events.length - 1 && (
              <div className={`w-0.5 h-12 ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
          
          <div className="flex-1 pb-8">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {event.title}
              </h4>
              {!event.completed && index === events.findIndex(e => !e.completed) && (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            {event.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                Block {event.timestamp}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
