/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Member } from "../hooks/room";
import { Room } from "../store/types/room";
import { User } from "../store/types/user";
import {
  faCheck,
  faCircleNotch,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

interface AddUserToRoomModalProps {
  handleSubmit: any;
  onHide: any;
  show: boolean;
  loading: boolean;
  addUserLoading: boolean;
  users: User[];
  room: Room;
  me: Member;
  organizationUsers: User[];
}

export default function AddUserToRoomModal(
  props: AddUserToRoomModalProps,
): JSX.Element {
  const { loading, addUserLoading, users, room, me, organizationUsers } = props;

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [loadingUser, setLoadingUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [usersAdded, setUsersAdded] = useState<number[]>([]);

  useEffect(() => {
    const usersAdded = users.map((user) => user.id);
    setUsersAdded(usersAdded);
  }, [users]);

  function addUser(userId: any) {
    setLoadingUser(userId);
    setUsersAdded([...new Set([...usersAdded, userId])]);
    props.handleSubmit(room.id, userId);
  }

  function handleHide() {
    setShowAddUserForm(false);
    setFilteredUsers([]);
    setUsersAdded([]);
    props.onHide();
  }

  function filterCurrentUsers() {
    const filteredUsers = organizationUsers.filter(
      (organizationUser) =>
        !users.find((user) => user.id === organizationUser.id),
    );
    setFilteredUsers(filteredUsers);

    setShowAddUserForm(true);
  }

  return (
    <Modal
      show={props.show}
      onHide={handleHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title className="font-weight-bolder">Members</Modal.Title>
        <Button
          variant="outline-secondary"
          style={{ borderColor: "transparent" }}
          onClick={() => props.onHide()}
        >
          <FontAwesomeIcon icon={faWindowClose}></FontAwesomeIcon>
        </Button>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <>
            <h1 className="text-center h5">Loading...</h1>

            <FontAwesomeIcon
              icon={faCircleNotch}
              className="mt-3"
              style={{ fontSize: "2.4rem", color: "#6772ef" }}
              spin
            />
          </>
        )}
        {!loading && !showAddUserForm && (
          <>
            {users.map(
              (user: {
                id: React.Key;
                avatar_url: string;
                first_name: React.ReactNode;
                last_name: React.ReactNode;
              }) => (
                <div key={user.id}>
                  <div className="align-items-center d-flex">
                    <Image
                      src={user.avatar_url}
                      fluid
                      roundedCircle
                      style={{ maxHeight: 30 }}
                      className="pr-2"
                    />
                    <p
                      className="text-left align-self-center"
                      style={{
                        fontWeight: 600,
                        paddingTop: 14,
                        fontSize: "1rem",
                      }}
                    >
                      {user.first_name} {user.last_name}{" "}
                      {user.id === me.id && "(you)"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </>
        )}
        {!loading &&
          showAddUserForm &&
          filteredUsers.map((user) => (
            <div key={user.id}>
              <div className="align-items-center d-flex">
                <Image
                  src={user.avatar_url}
                  fluid
                  roundedCircle
                  style={{ maxHeight: 30 }}
                  className="pr-2"
                />
                <p
                  className="text-left align-self-center"
                  style={{
                    fontWeight: 600,
                    paddingTop: 14,
                    fontSize: "1rem",
                  }}
                >
                  {user.first_name} {user.last_name}{" "}
                  {user.id === me.id && "(you)"}
                </p>
                {addUserLoading && loadingUser === user.id && (
                  <Button size="sm" className="ml-auto" disabled>
                    <FontAwesomeIcon icon={faCircleNotch} spin /> Adding to Room
                  </Button>
                )}
                {addUserLoading &&
                  loadingUser !== user.id &&
                  usersAdded.includes(user.id) && (
                    <Button size="sm" className="ml-auto" disabled>
                      {usersAdded.includes(user.id) ? (
                        <>
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{ color: "#3ecf8e" }}
                          />{" "}
                          Added to the Room
                        </>
                      ) : (
                        "Already in this Room"
                      )}
                    </Button>
                  )}

                {addUserLoading &&
                  loadingUser !== user.id &&
                  !usersAdded.includes(user.id) && (
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => addUser(user.id)}
                    >
                      Add to Room
                    </Button>
                  )}
              </div>
            </div>
          ))}
      </Modal.Body>
      <Modal.Footer style={{ justifyContent: "flex-start" }}>
        <Button
          size="lg"
          variant="outline-light"
          onClick={() =>
            showAddUserForm ? setShowAddUserForm(false) : filterCurrentUsers()
          }
        >
          Add People
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
