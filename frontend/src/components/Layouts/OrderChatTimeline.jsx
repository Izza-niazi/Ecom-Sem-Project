import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/** Compact vertical tracking timeline for shop chat bubbles. */
const OrderChatTimeline = ({ timeline, orderStatus, shortId }) => {
    if (!timeline?.length) return null;

    return (
        <div className="mt-2 space-y-0 border-t border-slate-600/60 pt-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Order #{shortId} · {orderStatus}
            </p>
            <ol className="space-y-1.5">
                {timeline.map((step) => (
                    <li key={step.status} className="flex gap-2">
                        <span className="mt-0.5 shrink-0">
                            {step.completed ? (
                                <CheckCircleIcon
                                    sx={{ fontSize: 14 }}
                                    className={step.active ? 'text-neutral-300' : 'text-emerald-500'}
                                />
                            ) : (
                                <RadioButtonUncheckedIcon
                                    sx={{ fontSize: 14 }}
                                    className="text-slate-600"
                                />
                            )}
                        </span>
                        <div className="min-w-0">
                            <p
                                className={`text-[11px] font-medium leading-tight ${
                                    step.completed ? 'text-slate-200' : 'text-slate-500'
                                }`}
                            >
                                {step.status}
                                {step.active && step.completed ? (
                                    <span className="ml-1 text-neutral-300">(current)</span>
                                ) : null}
                            </p>
                            {step.date ? (
                                <p className="text-[10px] text-slate-500">{step.date}</p>
                            ) : null}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default OrderChatTimeline;
