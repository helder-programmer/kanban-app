import { ISection } from "@/types/ISection";
import { ITask } from "@/types/ITask";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { DragDropContext, Draggable, DropResult, Droppable } from "react-beautiful-dnd";
import { Card } from "react-bootstrap";
import { BsPlusLg } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import styled from 'styled-components';


interface IProps {
    className?: string;
    sections: ISection[];
    updateSection(event: ChangeEvent<HTMLInputElement>, sectionId: string): Promise<void>;
    createTask(sectionId: string): Promise<void>;
    deleteSection(sectionId: string): Promise<void>;
    onDragEnd({ source, destination }: DropResult): Promise<void>;
    setCurrentTask: Dispatch<SetStateAction<ITask | undefined>>;
}

function List({
    className,
    sections,
    createTask,
    deleteSection,
    updateSection,
    onDragEnd,
    setCurrentTask }: IProps) {

    return (
        <section id="kanban" className={className}>
            <DragDropContext onDragEnd={onDragEnd}>
                {
                    sections.map(section => (
                        <Droppable key={section._id} droppableId={section._id} direction="vertical">
                            {(provided) => (
                                <div
                                    key={section._id}
                                    className="section p-3 bg-custom-black border border-custom-black-light shadow rounded mb-3"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-center mb-3">
                                        <input
                                            type="text"
                                            className="outline-0 bg-transparent w-100 border-0 text-custom-white"
                                            value={section.title}
                                            placeholder="Untitled"
                                            onChange={event => updateSection(event, section._id)}
                                        />
                                        <i
                                            className="fs-5 mx-2 text-custom-white"
                                            style={{ cursor: 'pointer' }}
                                            onClick={event => createTask(section._id)}
                                        >

                                            <BsPlusLg id="add-task-icon" />
                                        </i>
                                        <i
                                            className="fs-6 text-custom-white"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => deleteSection(section._id)}
                                        >
                                            <FaTrash id="delete-task-icon" />
                                        </i>
                                    </div>

                                    {section.tasks.map((task, index) =>
                                        <Draggable draggableId={task._id} key={task._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}>
                                                    <Card
                                                        className="text-custom-white p-2 mb-2 task"
                                                        onClick={() => setCurrentTask(task)}
                                                        style={{
                                                            backgroundColor: `${task.color}`
                                                        }}
                                                    >
                                                        {task.title ? task.title : 'Untitled'}
                                                    </Card>
                                                </div>
                                            )}
                                        </Draggable>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))
                }
            </DragDropContext >
        </section>
    );
}

const StyledList = styled(List)`
    max-width: calc(100vw - 362px);
    display: flex;
    overflow: auto;
    align-items: flex-start;
    max-height: calc(100vh - 300px);
    gap: 2rem;

    .section {
        width: 250px;
        min-width: 250px;
    }


    #add-task-icon:hover {
        color: #008000;
    }

    #delete-task-icon:hover {
        color: #a30101;
    }

    input[type=text] {
        outline: none;
    }

`;


export default StyledList;