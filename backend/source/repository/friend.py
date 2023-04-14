import mysql.connector

from mysql.connector import pooling, connection, connection_cext
from collections import Counter
from typing import Optional, Any

from helper import search

class InitializeRepository:
    def __init__(
            self,
            database_source: pooling.PooledMySQLConnection | connection.MySQLConnection | connection_cext.CMySQLConnection
        ) -> None:
        self.database = database_source
        self.cursor = self.database.cursor(buffered=True)
        
    def friend_list(self, owner_reference):
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s LIMIT 10"
            self.cursor.execute(query_model, (owner_reference, ))
            friend_row: Optional[list] = self.cursor.fetchall()
                
        except mysql.connector.Error as err:
            return str(err.msg)
                
        friend_object: list[dict[str, Any]] = []
        try:
            query_model = "SELECT id, first_name, last_name, profile_slug FROM member_collection_schema WHERE id = %s LIMIT 1"
            for friend in friend_row:
                self.cursor.execute(query_model, (str(friend[0]), ))
                personal_row: Optional[tuple] = self.cursor.fetchone()
                    
                if personal_row is not None:
                    friend_object.append({
                        "id": personal_row[0],
                        "full_name": "{} {}".format(str(personal_row[1]), str(personal_row[2])),
                        "profile_slug": str(personal_row[3])
                    })
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        return friend_object
        
    def friend_request_list(self, owner_reference):
        try:
            query_model = "SELECT friend_request_by FROM friend_request_collection_schema WHERE request_to = %s LIMIT 10"
            self.cursor.execute(query_model, (owner_reference, ))
            request_row: Optional[list] = self.cursor.fetchall()
                
        except mysql.connector.Error as err:
                return str(err.msg)
        
        friend_request_object: list[dict[str, Any]] = []
        try:
            query_model = "SELECT id, first_name, last_name, profile_slug FROM member_collection_schema WHERE id = %s LIMIT 1"
            for request in request_row:
                self.cursor.execute(query_model, (str(request[0]), ))
                personal_row: Optional[tuple] = self.cursor.fetchone()
                    
                if personal_row is not None:
                    friend_request_object.append({
                        "id": personal_row[0],
                        "full_name": "{} {}".format(str(personal_row[1]), str(personal_row[2])),
                        "profile_slug": str(personal_row[3])
                    })
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        return friend_request_object
    
    async def friend_request(self, friend_request_by, request_to):
        if str(friend_request_by) == str(request_to):
            return "you cannot add yourself as a friend."
        
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s LIMIT 1"
            self.cursor.execute(query_model, (friend_request_by, ))
            relation_row: Optional[tuple] = self.cursor.fetchone()
            
            if relation_row is not None:
                if str(relation_row[0]) == str(request_to):
                    return "You are already friends with this person."
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        request_available: list[Any] = []
        try:
            query_model = "SELECT friend_request_by FROM friend_request_collection_schema WHERE request_to = %s"
            self.cursor.execute(query_model, (friend_request_by, ))
            request_from_row: Optional[list] = self.cursor.fetchall()
            
            for request in request_from_row:
                request_available.append(request[0])
                
            if int(request_to) in request_available:
                return "you cannot make a friend request because the target that you want to request is in your friend request list."
                
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "SELECT friend_request_by, request_to FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s LIMIT 1"
            self.cursor.execute(query_model, (friend_request_by, request_to, ))
            friend_request_row: Optional[tuple] = self.cursor.fetchone()
            
            if friend_request_row is not None:         
                if ((str(friend_request_row[0]) == str(friend_request_by)) and (str(friend_request_row[1]) == str(request_to))):
                    return "you have already sent a friend request."
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "SELECT id, COUNT(*) FROM member_collection_schema WHERE id = %s GROUP BY id"
            self.cursor.execute(query_model, (request_to, ))
            
            row_count = self.cursor.rowcount
            if row_count < 1:
                return "the user who wants to add friends doesn't exist."
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "INSERT INTO friend_request_collection_schema (friend_request_by, request_to) VALUES (%s, %s)"
            self.cursor.execute(query_model, (friend_request_by, request_to, ))
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        return "you have sent a friend request."
    
    async def friend_approve(self, owner_reference, approve_to):
        if str(owner_reference) == str(approve_to):
            return "you can't accept yourself as a friend."
        
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s AND relation_with = %s LIMIT 1"
            self.cursor.execute(query_model, (owner_reference, approve_to, ))
            relation_row: Optional[tuple] = self.cursor.fetchone()
            
            if relation_row is not None:
                if str(relation_row[0]) == str(approve_to):
                    return "you are already friends with this person."
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "SELECT friend_request_by FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s LIMIT 1"
            self.cursor.execute(query_model, (owner_reference, approve_to, ))
            request_row: Optional[tuple] = self.cursor.fetchone()
            
            if request_row is None:
                query_model = "SELECT friend_request_by FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s LIMIT 1"
                self.cursor.execute(query_model, (approve_to, owner_reference, ))
                request_row: Optional[tuple] = self.cursor.fetchone()
                
                if request_row is None:
                    return "you dont't have the friend request from them."
                
                if request_row is not None:
                    try:
                        query_model = "DELETE FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s"
                        self.cursor.execute(query_model, (approve_to, owner_reference, ))
                        self.database.commit()
        
                    except mysql.connector.Error as err:
                        return str(err.msg)
                    
                    try:
                        query_model = "INSERT INTO friend_collection_schema (relation_by, relation_with) VALUES (%s, %s)"
                        self.cursor.execute(query_model, (owner_reference, approve_to, ))
                        self.database.commit()
        
                    except mysql.connector.Error as err:
                        return str(err.msg)
                    
                    try:
                        query_model = "INSERT INTO friend_collection_schema (relation_by, relation_with) VALUES (%s, %s)"
                        self.cursor.execute(query_model, (approve_to, owner_reference, ))
                        self.database.commit()
        
                    except mysql.connector.Error as err:
                        return str(err.msg)
                    
                    return "you have accepted your friend request."
            
            if request_row is not None:
                if str(owner_reference) == str(request_row[0]):
                    return "you cannot accept the friend request instead target."
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
    async def friend_cancel(self, owner_reference, cancel_to):
        if str(owner_reference) == str(cancel_to):
            return "you can't cancel yourself."
        
        try:
            query_model = "DELETE FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s"
            self.cursor.execute(query_model, (owner_reference, cancel_to, ))
            self.database.commit()
            
            row_count = self.cursor.rowcount
            if row_count < 1:
                return "friend request dosen't exists."
        
        except mysql.connector.Error as err:
            return str(err.msg)
    
        return "you have cancel your request for them."
    
    async def friend_deny(self, owner_reference, deny_to):
        if str(owner_reference) == str(deny_to):
            return "you can't deny yourself."
        
        try:
            query_model = "SELECT friend_request_by FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s LIMIT 1"
            self.cursor.execute(query_model, (owner_reference, deny_to, ))
            request_row: Optional[tuple] = self.cursor.fetchone()
            
            if request_row is not None:
                if str(owner_reference) == str(request_row[0]):
                    return "you cannot deny the friend request instead target."
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "DELETE FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s"
            self.cursor.execute(query_model, (deny_to, owner_reference, ))
            self.database.commit()
            
            row_count = self.cursor.rowcount
            if row_count < 1:
                return "friend request dosen't exists."
        
        except mysql.connector.Error as err:
            return str(err.msg)
    
        return "you have removed the friend request."
    
    async def friend_delete(self, owner_reference, target_delete):
        if str(owner_reference) == str(target_delete):
            return "you can't delete yourself as a friend."
        
        try:
            query_model = "SELECT relation_with, COUNT(*) FROM friend_collection_schema WHERE relation_by = %s AND relation_with = %s GROUP BY relation_with"
            self.cursor.execute(query_model, (owner_reference, target_delete, ))
            
            row_count = self.cursor.rowcount
            if row_count < 1:
                return "you are not friends with that id."
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "DELETE FROM friend_collection_schema WHERE (relation_by = %s AND relation_with = %s) OR (relation_by = %s AND relation_with = %s)"
            self.cursor.execute(query_model, (owner_reference, target_delete, target_delete, owner_reference, ))
            self.database.commit()
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        return "you have deleted your friend."
    
    async def friend_mutual_total(self, owner_reference, target_mutual):
        if str(owner_reference) == str(target_mutual):
            return "you can't check mutual friend yourself."
        
        try:
            query_model = "SELECT id, COUNT(*) FROM member_collection_schema WHERE id = %s GROUP BY id"
            self.cursor.execute(query_model, (target_mutual, ))
            
            row_count = self.cursor.rowcount
            if row_count < 1:
                return "the user who wants to check mutual friend doesn't exist."
                
        except mysql.connector.Error as err:
            return str(err.msg)
        
        one_mutual_friend_collection: list = []
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s"
            self.cursor.execute(query_model, (owner_reference, ))
            own_friend_row: Optional[list] = self.cursor.fetchall()
                   
            for mutual in range(0, len(own_friend_row)):
                one_mutual_friend_collection.append(own_friend_row[mutual][0])
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        two_mutual_friend_collection: list = []
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s"
            self.cursor.execute(query_model, (target_mutual, ))
            target_friend_row: Optional[list] = self.cursor.fetchall()

            for mutual in range(0, len(target_friend_row)):
                two_mutual_friend_collection.append(target_friend_row[mutual][0])
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        combined_friend_counter = Counter(one_mutual_friend_collection + two_mutual_friend_collection)
        mutual_friends = {element for element, count in combined_friend_counter.items() if count > 1}
        
        if len(mutual_friends) == 0:
            return "no mutual friends."
        
        return len(mutual_friends)
        
    async def friend_recommended(self, owner_reference, target_mutual):        
        check_friend_list: list = []
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s"
            self.cursor.execute(query_model, (owner_reference, ))
            friend_row: Optional[list] = self.cursor.fetchall()
            
            for index in range(0, len(friend_row)):
                check_friend_list.append(friend_row[index][0])
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        if target_mutual in check_friend_list:
            return False
        
        idx_list: list = []
        try:
            query_model = "SELECT id FROM member_collection_schema"
            self.cursor.execute(query_model)
            idx_row: Optional[list] = self.cursor.fetchall()
            
            for index in range(0, len(idx_row)):
                idx_list.append(idx_row[index][0])
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        mutual_dict = {str(key): [] for key in idx_list}
        
        try:
            query_model = "SELECT relation_with FROM friend_collection_schema WHERE relation_by = %s"
            for id in idx_list:
                self.cursor.execute(query_model, (id, ))
                friend_list: Optional[list] = self.cursor.fetchall()
                
                for index in range(0, len(friend_list)):
                    mutual_dict[str(id)].append(str(friend_list[index][0]))
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        all_paths: list = search.find_shortest_path(mutual_dict, str(owner_reference), str(target_mutual))
        flattened_list = [path for sublist in all_paths for path in sublist]
        
        delimiter = " -> "
        if len(flattened_list) > 0:
            print(delimiter.join(flattened_list))
        
        if len(all_paths) < 1:
            return False
        
        return all_paths
    
    def is_friend(self, owner_reference, target):
        friend_status = "not"
        
        try:
            query_model = "SELECT friend_request_by, COUNT(*) FROM friend_request_collection_schema WHERE friend_request_by = %s AND request_to = %s GROUP BY friend_request_by"
            self.cursor.execute(query_model, (owner_reference, target, ))
            
            row_count = self.cursor.rowcount
            if row_count > 0:
                friend_status = "pending"
                return friend_status
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        try:
            query_model = "SELECT friend_id FROM friend_collection_schema WHERE relation_by = %s AND relation_with = %s LIMIT 1"
            self.cursor.execute(query_model, (owner_reference, target, ))
            friend_row: Optional[tuple] = self.cursor.fetchone()
            
            if friend_row is not None:
                friend_status = "friend"
                return friend_status
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        return friend_status