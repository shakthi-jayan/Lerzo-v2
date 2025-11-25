import React, { useState, useMemo, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useData } from '../context/DataContext';
import { Enquiry, EnquiryStatus } from '../types';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Components ---

const KanbanCard: React.FC<{ enquiry: Enquiry; isOverlay?: boolean }> = ({ enquiry, isOverlay = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: enquiry.id,
        data: {
            type: 'Enquiry',
            enquiry,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 h-[120px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow ${isOverlay ? 'cursor-grabbing shadow-xl rotate-2 scale-105' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{enquiry.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${enquiry.status === EnquiryStatus.ACTIVE ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    enquiry.status === EnquiryStatus.CONVERTED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {enquiry.courseInterested}
                </span>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="w-3 h-3 mr-1.5" />
                    {enquiry.mobile}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {new Date(enquiry.addedOn).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ id, title, enquiries }: { id: string; title: string; enquiries: Enquiry[] }) => {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
            columnId: id,
        },
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[300px] w-full md:w-1/3">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {enquiries.length}
                    </span>
                </div>
            </div>

            <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]">
                <SortableContext items={enquiries.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    {enquiries.map((enquiry) => (
                        <KanbanCard key={enquiry.id} enquiry={enquiry} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

interface EnquiryKanbanProps {
    hideHeader?: boolean;
    externalSearchQuery?: string;
}

export const EnquiryKanban = ({ hideHeader = false, externalSearchQuery = '' }: EnquiryKanbanProps) => {
    const { enquiries, updateEnquiry } = useData();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (externalSearchQuery !== undefined) {
            setSearchQuery(externalSearchQuery);
        }
    }, [externalSearchQuery]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require 5px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredEnquiries = useMemo(() => {
        if (!searchQuery) return enquiries;
        return enquiries.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.mobile.includes(searchQuery)
        );
    }, [enquiries, searchQuery]);

    const columns = useMemo(() => {
        return {
            [EnquiryStatus.ACTIVE]: filteredEnquiries.filter(e => e.status === EnquiryStatus.ACTIVE),
            [EnquiryStatus.CONVERTED]: filteredEnquiries.filter(e => e.status === EnquiryStatus.CONVERTED),
            [EnquiryStatus.CLOSED]: filteredEnquiries.filter(e => e.status === EnquiryStatus.CLOSED),
        };
    }, [filteredEnquiries]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the enquiry being dragged
        const activeEnquiry = enquiries.find(e => e.id === activeId);
        if (!activeEnquiry) return;

        // Determine target status
        let targetStatus: EnquiryStatus | undefined;

        // If dropped on a column directly
        if (Object.values(EnquiryStatus).includes(overId as EnquiryStatus)) {
            targetStatus = overId as EnquiryStatus;
        }
        // If dropped on another card
        else {
            const overEnquiry = enquiries.find(e => e.id === overId);
            if (overEnquiry) {
                targetStatus = overEnquiry.status;
            }
        }

        if (targetStatus && targetStatus !== activeEnquiry.status) {
            // Optimistic update handled by DataContext if we wanted, but here we just call update
            await updateEnquiry(activeId, { status: targetStatus });
        }
    };

    const activeEnquiry = activeId ? enquiries.find(e => e.id === activeId) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col"
        >
            {/* Header */}
            {!hideHeader && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <div className="w-6 h-6 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">K</div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Enquiry Board</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your leads pipeline</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search enquiries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 border-slate-300 dark:border-slate-600 rounded-md pl-9 p-2.5 text-sm border focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>
                        <Link to="/enquiries/add" className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
                    <KanbanColumn
                        id={EnquiryStatus.ACTIVE}
                        title="Active Leads"
                        enquiries={columns[EnquiryStatus.ACTIVE]}
                    />
                    <KanbanColumn
                        id={EnquiryStatus.CONVERTED}
                        title="Converted"
                        enquiries={columns[EnquiryStatus.CONVERTED]}
                    />
                    <KanbanColumn
                        id={EnquiryStatus.CLOSED}
                        title="Closed"
                        enquiries={columns[EnquiryStatus.CLOSED]}
                    />
                </div>

                <DragOverlay>
                    {activeEnquiry ? <KanbanCard enquiry={activeEnquiry} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </motion.div>
    );
};
