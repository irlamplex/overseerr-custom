import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import { UserSettingsNotificationsResponse } from '../../../../../server/interfaces/api/userSettingsInterfaces';
import {
  hasNotificationAgentEnabled,
  NotificationAgentType,
} from '../../../../../server/lib/notifications/agenttypes';
import useSettings from '../../../../hooks/useSettings';
import { useUser } from '../../../../hooks/useUser';
import globalMessages from '../../../../i18n/globalMessages';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';

const messages = defineMessages({
  telegramsettingssaved: 'Telegram notification settings saved successfully!',
  telegramsettingsfailed: 'Telegram notification settings failed to save.',
  enableTelegram: 'Enable Notifications',
  telegramChatId: 'Chat ID',
  telegramChatIdTip: 'Add <GetIdBotLink>@get_id_bot</GetIdBotLink> to the chat',
  telegramChatIdTipLong:
    '<TelegramBotLink>Start a chat</TelegramBotLink>, add <GetIdBotLink>@get_id_bot</GetIdBotLink>, and issue the <code>/my_id</code> command',
  sendSilently: 'Send Silently',
  sendSilentlyDescription: 'Send notifications with no sound',
  validationTelegramChatId: 'You must provide a valid chat ID',
});

const UserTelegramSettings: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();
  const { addToast } = useToasts();
  const router = useRouter();
  const [notificationAgents, setNotificationAgents] = useState(0);
  const { user } = useUser({ id: Number(router.query.discordId) });
  const { data, error, revalidate } = useSWR<UserSettingsNotificationsResponse>(
    user ? `/api/v1/user/${user?.id}/settings/notifications` : null
  );

  useEffect(() => {
    setNotificationAgents(
      data?.notificationAgents ?? NotificationAgentType.EMAIL
    );
  }, [data]);

  const UserTelegramSettingsSchema = Yup.object().shape({
    telegramChatId: Yup.string()
      .when('enableTelegram', {
        is: true,
        then: Yup.string().required(
          intl.formatMessage(messages.validationTelegramChatId)
        ),
        otherwise: Yup.string().nullable(),
      })
      .typeError(intl.formatMessage(messages.validationTelegramChatId))
      .matches(
        /^[-]?\d+$/,
        intl.formatMessage(messages.validationTelegramChatId)
      ),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        telegramChatId: data?.telegramChatId,
        telegramSendSilently: data?.telegramSendSilently,
      }}
      validationSchema={UserTelegramSettingsSchema}
      enableReinitialize
      onSubmit={async (values) => {
        try {
          await axios.post(`/api/v1/user/${user?.id}/settings/notifications`, {
            notificationAgents,
            telegramChatId: values.telegramChatId,
            telegramSendSilently: values.telegramSendSilently,
          });
          addToast(intl.formatMessage(messages.telegramsettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.telegramsettingsfailed), {
            appearance: 'error',
            autoDismiss: true,
          });
        } finally {
          revalidate();
        }
      }}
    >
      {({ errors, touched, isSubmitting }) => {
        return (
          <Form className="section">
            <div className="form-row">
              <label htmlFor="enableTelegram" className="checkbox-label">
                {intl.formatMessage(messages.enableTelegram)}
              </label>
              <div className="form-input">
                <Field
                  type="checkbox"
                  id="enableTelegram"
                  name="enableTelegram"
                  checked={hasNotificationAgentEnabled(
                    NotificationAgentType.TELEGRAM,
                    notificationAgents
                  )}
                  onChange={() => {
                    setNotificationAgents(
                      hasNotificationAgentEnabled(
                        NotificationAgentType.TELEGRAM,
                        notificationAgents
                      )
                        ? notificationAgents - NotificationAgentType.TELEGRAM
                        : notificationAgents + NotificationAgentType.TELEGRAM
                    );
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="telegramChatId" className="text-label">
                <span>{intl.formatMessage(messages.telegramChatId)}</span>
                <span className="label-tip">
                  {settings.currentSettings.telegramBotUsername
                    ? intl.formatMessage(messages.telegramChatIdTipLong, {
                        TelegramBotLink: function TelegramBotLink(msg) {
                          return (
                            <a
                              href={`https://telegram.me/${settings.currentSettings.telegramBotUsername}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {msg}
                            </a>
                          );
                        },
                        GetIdBotLink: function GetIdBotLink(msg) {
                          return (
                            <a
                              href="https://telegram.me/get_id_bot"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {msg}
                            </a>
                          );
                        },
                        code: function code(msg) {
                          return <code>{msg}</code>;
                        },
                      })
                    : intl.formatMessage(messages.telegramChatIdTip, {
                        GetIdBotLink: function GetIdBotLink(msg) {
                          return (
                            <a
                              href="https://telegram.me/get_id_bot"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {msg}
                            </a>
                          );
                        },
                      })}
                </span>
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <Field
                    id="telegramChatId"
                    name="telegramChatId"
                    type="text"
                  />
                </div>
                {errors.telegramChatId && touched.telegramChatId && (
                  <div className="error">{errors.telegramChatId}</div>
                )}
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="telegramSendSilently" className="checkbox-label">
                <span className="mr-2">
                  {intl.formatMessage(messages.sendSilently)}
                </span>
                <span className="label-tip">
                  {intl.formatMessage(messages.sendSilentlyDescription)}
                </span>
              </label>
              <div className="form-input">
                <Field
                  type="checkbox"
                  id="telegramSendSilently"
                  name="telegramSendSilently"
                />
              </div>
            </div>
            <div className="actions">
              <div className="flex justify-end">
                <span className="inline-flex ml-3 rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? intl.formatMessage(globalMessages.saving)
                      : intl.formatMessage(globalMessages.save)}
                  </Button>
                </span>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserTelegramSettings;
