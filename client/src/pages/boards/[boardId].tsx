import { ChangeEvent, useEffect, useState } from 'react';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import Head from 'next/head';

import { boardService } from "@/services/board";
import { useBoards } from '@/contexts/boards';
import { ISection } from '@/types/ISection';
import EmojiPicker from '@/components/common/emojiPicker';
import AppLayout from "@/components/layouts/appLayout";
import Kanban from '@/components/common/kanban';

type CurrentBoardInformations = {
    icon: string;
    title: string;
    description: string;
    favorite: boolean;
}


function Board() {
    const [currentBoardInformations, setCurrentBoardInformations] = useState({} as CurrentBoardInformations);
    const [sections, setSections] = useState<ISection[]>([]);
    const boardsContext = useBoards();
    const router = useRouter();
    const boardId = String(router.query['boardId']);
    const [isLoading, setIsLoading] = useState(false);

    const deleteBoard = async () => {
        const confirmation = confirm('Do you want delete this board?');

        if (!confirmation) return;

        setIsLoading(true);

        await boardService.deleteBoard({ boardId });

        const newBoards = [...boardsContext.boards];
        const index = newBoards.findIndex(board => board.board_id === boardId);
        newBoards.splice(index, 1);

        const newFavoritesBoards = [...boardsContext.favoritesBoards];
        const favoriteIndex = newFavoritesBoards.findIndex(board => board.board_id === boardId);
        newFavoritesBoards.splice(favoriteIndex, 1);

        boardsContext.setBoards(newBoards);
        boardsContext.setFavoritesBoards(newFavoritesBoards);

        try {
            await boardService.updateBoardsPositions({ boards: newBoards });
            await boardService.updateFavoritesBoardsPosition({ boards: newFavoritesBoards });
        } catch (err: any) {
            console.log(err);
        }


        if (newBoards.length > 0)
            return router.push(`/boards/${newBoards[0].board_id}`);
        else
            return router.push('/');
    }

    const onIconChange = async (newIcon: string) => {
        let newBoards = [...boardsContext.boards];
        const index = newBoards.findIndex(board => board.board_id === boardId);
        newBoards[index].icon = newIcon;
        boardsContext.setBoards(newBoards);


        if (currentBoardInformations.favorite) {
            let newFavoritesBoards = [...boardsContext.favoritesBoards];
            const index = newFavoritesBoards.findIndex(board => board.board_id === boardId);
            newFavoritesBoards[index].icon = newIcon;
            boardsContext.setFavoritesBoards(newFavoritesBoards);
        }

        try {
            await boardService.updateBoard({ boardId, icon: newIcon });
        } catch (err: any) {
            console.log(err);
        }
    }


    const updateTitle = async (event: ChangeEvent<HTMLInputElement>) => {
        let timer;
        const timeout = 600;
        clearTimeout(timer);

        let newTitle = event.target.value;
        setCurrentBoardInformations({ ...currentBoardInformations, title: newTitle });

        let newBoards = [...boardsContext.boards];
        const index = newBoards.findIndex(board => board.board_id === boardId);
        newBoards[index].title = newTitle;

        boardsContext.setBoards(newBoards);

        if (currentBoardInformations.favorite) {
            let newFavoritesBoards = [...boardsContext.favoritesBoards];
            const index = newFavoritesBoards.findIndex(board => board.board_id === boardId);
            newFavoritesBoards[index] = { ...newFavoritesBoards[index], title: newTitle };
            boardsContext.setFavoritesBoards(newFavoritesBoards);
        }


        timer = setTimeout(async () => {
            try {
                await boardService.updateBoard({ boardId, title: newTitle });
            } catch (err: any) {
                console.log(err);
            }
        }, timeout);
    }

    const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
        let timer;
        const timeout = 600;

        clearTimeout(timer);

        let newDescription = event.target.value;
        setCurrentBoardInformations({ ...currentBoardInformations, description: newDescription });

        timer = setTimeout(async () => {
            try {
                await boardService.updateBoard({ boardId, description: newDescription });
            } catch (err: any) {
                console.log(err);
            }
        }, timeout);

    }

    const updateFavorite = async () => {
        const isFavorite = !currentBoardInformations.favorite;
        setCurrentBoardInformations({ ...currentBoardInformations, favorite: isFavorite });

        let newFavoritesBoards = [...boardsContext.favoritesBoards];
        const board = await boardService.getOneBoard({ boardId });


        if (isFavorite)
            newFavoritesBoards = [...newFavoritesBoards, board];
        else {
            const index = newFavoritesBoards.findIndex(board => board.board_id === boardId);
            newFavoritesBoards.splice(index, 1);
        }

        boardsContext.setFavoritesBoards(newFavoritesBoards);

        try {
            await boardService.updateBoard({ boardId, favorite: isFavorite });
        } catch (err: any) {
            console.log(err);
        }
    }


    const verifyBoardId = async (boardId: string) => {
        const boards = await boardService.getBoards();
        const isValidBoardId = !!boards.find(board => board.board_id === boardId);
        return isValidBoardId;
    }


    const getOneBoard = async () => {
        try {
            if (!await verifyBoardId(boardId)) return router.replace(`/boards/${boardsContext.boards[0].board_id}`);
            
            setIsLoading(true);

            const board = await boardService.getOneBoard({ boardId });
            setCurrentBoardInformations({
                title: board.title,
                description: board.description,
                icon: board.icon,
                favorite: board.favorite,
            });
            setSections(board.sections);

            setIsLoading(false);
        } catch (err: any) {
            console.log(err);
        }
    }


    useEffect(() => {
        if (!router.isReady) return;

        getOneBoard();

    }, [boardId]);

    if (isLoading) {
        return (
            <AppLayout>
                <main className="px-2 py-3 d-flex flex-column h-100 d-flex align-items-center justify-content-center" style={{ width: '100%', overflow: 'hidden' }}>
                    <Spinner variant="none" animation="border" className="text" />
                </main>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head>
                <title>Board "{currentBoardInformations.title || 'Untitled'}"</title>
            </Head>
            <main className="px-2 py-3 d-flex flex-column h-100" style={{ width: '100%', overflow: 'hidden' }}>
                <section className="d-flex w-100 justify-content-between mb-2 px-2">
                    <i
                        className="text-warning"
                        style={{ cursor: 'pointer' }}
                        onClick={updateFavorite}
                        title='Favorite this board'
                    >
                        {currentBoardInformations?.favorite ? <AiFillStar className="fs-4" id="star-fill" /> : <AiOutlineStar className="fs-4" />}
                    </i>
                    <i
                        style={{ cursor: 'pointer' }}
                        onClick={() => deleteBoard()}
                        title="Delete this board"
                    >
                        <FaTrash className="fs-5 text-danger" />
                    </i>
                </section>

                <section className="px-4">
                    <section>
                        <div className="d-flex align-items-center gap-2">

                            <EmojiPicker icon={currentBoardInformations.icon} onChange={onIconChange} />
                            <input
                                value={currentBoardInformations.title}
                                className="w-100 border-0 bg-transparent fs-2 p-0 outline-none fw-bold text"
                                style={{ outline: 'none' }}
                                placeholder="Untitled"
                                type="text"
                                maxLength={150}
                                onChange={updateTitle}
                            />
                        </div>
                        <input
                            value={currentBoardInformations.description}
                            className="w-100 mt-2 bg-transparent border-0 p-0 outline-none ps-5 text"
                            style={{ outline: 'none', resize: 'none' }}
                            placeholder="Add description here..."
                            onChange={updateDescription}
                            maxLength={250}
                        />
                    </section>


                    <Kanban sections={sections} setSections={setSections} boardId={boardId} />
                </section>
            </main>
        </AppLayout>
    );
}

export default Board;