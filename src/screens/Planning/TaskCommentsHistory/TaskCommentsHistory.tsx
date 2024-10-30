import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import moment from 'moment';
import Content from './containers/Content';
import { styles } from './TaskCommentsHistory.styles';
import { updateDocument } from '../../../utils/coucdb_call';
import CommentsAPI from '../../../services/planning/comments';
moment.locale('fr');

function TaskCommentsHistory(
  { taskPlanned, selectedDate, comments, setComments, commentsRead, onRefresh }: 
  { taskPlanned: any, selectedDate: any, comments: any, setComments: (i: any) => void, commentsRead: boolean, onRefresh: () => void }
) {
  const customStyles = styles();
  
  const comment_read = async () => {
    // if ([undefined, false].includes(commentsRead)) {
    if(commentsRead){
      try {
        // updateDocument(taskPlanned.task_id, function (doc: any) {
        //   let planning = doc.planning ?? [];

        //   let planning_edit = planning.find((elt: any) => elt.planned_date == selectedDate);

        //   planning_edit.comments_read = true;
        //   planning_edit.comments = planning_edit.comments.map((elt: any) => {
        //     return {
        //       ...elt,
        //       comment_read: true
        //     }
        //   });
        //   setComments(planning_edit.comments)
        //   planning_edit.updated_date = moment();

        //   let filter_planning = planning.filter((elt: any) => elt.planned_date != selectedDate);
        //   filter_planning.push(planning_edit);

        //   planning = filter_planning;


        //   planning.sort((a: any, b: any) => {
        //     if (a.planned_datetime_start < b.planned_datetime_start) {
        //       return -1;
        //     }
        //     if (a.planned_datetime_start > b.planned_datetime_start) {
        //       return 1;
        //     }
        //     return 0;
        //   });


        //   doc.planning = planning;

        //   return doc;
        // })
          let _comments = comments.map((elt: any) => {
            return {
              ...elt,
              activity: taskPlanned?.id ?? (elt?.activity?.id ?? elt?.activity),
              user: elt?.user?.id ?? elt?.user,
              facilitator: elt?.facilitator?.id ?? elt?.facilitator,
              comment_read: true
            }
          });
          console.log(_comments)
          setComments(_comments)
        await new CommentsAPI().save_comments(
          _comments
        ).then(function (res: any) {

            onRefresh();
            
          }).catch(function (err: any) {
          });

      } catch (e) {

      }
    }
  };


  useEffect(() => {
    comment_read();
  }, []);

  
  // if (!comments)
  //   return <ActivityIndicator style={{ paddingTop: '40%' }} size="small" color="#24c38b" />;
  return (
    <SafeAreaView style={customStyles.container}>
      <Content comments={comments} />
    </SafeAreaView>
  );
}

export default TaskCommentsHistory;
